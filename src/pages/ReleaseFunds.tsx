
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { ethers } from "ethers";
import { amoy } from "@/config/chains";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReleaseFunds } from "@/hooks/escrow/useReleaseFunds";

export default function ReleaseFunds() {
  const { id } = useParams();
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [sellerAddress, setSellerAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        if (!id) return;

        const { data: transaction, error } = await supabase
          .from('transactions')
          .select(`
            *,
            listings (
              title,
              crypto_amount,
              crypto_currency
            ),
            blockchain_txn_id,
            seller_wallet_address
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setTransactionDetails(transaction);
        setSellerAddress(transaction.seller_wallet_address);

      } catch (error) {
        console.error("Erreur lors de la récupération des détails:", error);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  const { isReleasing, handleReleaseFunds } = useReleaseFunds(
    id || '',
    transactionDetails?.blockchain_txn_id,
    sellerAddress
  );

  if (!transactionDetails) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Libération des fonds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Article</h3>
                <p className="text-sm text-muted-foreground">
                  {transactionDetails.listings?.title}
                </p>
              </div>

              <div>
                <h3 className="font-medium">Montant</h3>
                <p className="text-sm text-muted-foreground">
                  {transactionDetails.listings?.crypto_amount} {transactionDetails.listings?.crypto_currency}
                </p>
              </div>

              {sellerAddress && (
                <div>
                  <h3 className="font-medium">Adresse du vendeur</h3>
                  <p className="text-sm text-muted-foreground break-all">
                    {sellerAddress}
                  </p>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  En libérant les fonds, vous confirmez avoir reçu l'article en bon état.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleReleaseFunds}
                disabled={isReleasing || !sellerAddress}
                className="w-full"
              >
                {isReleasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Libération des fonds en cours...
                  </>
                ) : (
                  "Confirmer la réception et libérer les fonds"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
