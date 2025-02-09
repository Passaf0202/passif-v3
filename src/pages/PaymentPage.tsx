
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const ESCROW_ABI = [
  "function transactionCount() view returns (uint256)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "function releaseFunds(uint256 txnId)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export default function PaymentPage() {
  const { id } = useParams();
  const [sellerAddress, setSellerAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        if (!id) {
          setError("ID de transaction manquant");
          return;
        }

        console.log("Fetching transaction details for ID:", id);

        const { data: transaction, error: fetchError } = await supabase
          .from('transactions')
          .select(`
            *,
            listings (
              title,
              crypto_amount,
              crypto_currency
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching transaction:", fetchError);
          throw fetchError;
        }

        if (!transaction) {
          setError("Transaction introuvable");
          return;
        }

        console.log("Transaction details:", transaction);
        setTransactionDetails(transaction);

        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider);
          
          const count = await contract.transactionCount();
          const txnId = count.sub(1);
          console.log("Dernier ID de transaction:", txnId.toString());
          
          const txnData = await contract.transactions(txnId);
          console.log("Données de la transaction:", txnData);
          
          setSellerAddress(txnData.seller);
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération des détails:", error);
        setError(error.message || "Une erreur est survenue lors de la récupération des détails");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id, toast]);

  const handleReleaseFunds = async () => {
    if (!window.ethereum || !sellerAddress) return;

    try {
      setIsLoading(true);

      if (chain?.id !== amoy.id) {
        if (switchNetwork) {
          await switchNetwork(amoy.id);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw new Error("Impossible de changer de réseau");
        }
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      const count = await contract.transactionCount();
      const txnId = count.sub(1);
      console.log("Libération des fonds pour la transaction:", txnId.toString());

      const tx = await contract.releaseFunds(txnId);
      console.log("Transaction envoyée:", tx.hash);

      const receipt = await tx.wait();
      console.log("Reçu de la transaction:", receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            escrow_status: 'completed',
            released_at: new Date().toISOString(),
            buyer_confirmation: true
          })
          .eq('id', id);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés au vendeur",
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de la libération des fonds:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!transactionDetails) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>
              Aucune transaction trouvée avec cet identifiant.
            </AlertDescription>
          </Alert>
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
                disabled={isLoading || !sellerAddress}
                className="w-full"
              >
                {isLoading ? (
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
