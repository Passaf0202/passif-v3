import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAccount } from 'wagmi';
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactionAndListing = async () => {
      // Fetch transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          buyer:profiles!transactions_buyer_id_fkey (
            wallet_address
          ),
          seller:profiles!transactions_seller_id_fkey (
            wallet_address
          ),
          listing:listings!transactions_listing_id_fkey (
            *
          )
        `)
        .eq('id', transactionId)
        .maybeSingle();

      if (transactionError) {
        console.error('Error fetching transaction:', transactionError);
        return;
      }

      console.log('Transaction data:', transactionData);
      setTransaction(transactionData);
      setListing(transactionData.listing);
    };

    fetchTransactionAndListing();

    // Souscrire aux changements de la transaction
    const subscription = supabase
      .channel('transaction_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          console.log('Transaction updated:', payload);
          setTransaction(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId]);

  const handleConfirmation = async () => {
    if (!transaction || !address) return;

    setIsLoading(true);
    try {
      const isBuyer = address.toLowerCase() === transaction.buyer.wallet_address?.toLowerCase();
      const isSeller = address.toLowerCase() === transaction.seller.wallet_address?.toLowerCase();

      if (!isBuyer && !isSeller) {
        throw new Error("Vous n'êtes pas autorisé à confirmer cette transaction");
      }

      const { error } = await supabase
        .from('transactions')
        .update({
          buyer_confirmation: isBuyer ? true : transaction.buyer_confirmation,
          seller_confirmation: isSeller ? true : transaction.seller_confirmation,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Confirmation enregistrée",
        description: "Votre confirmation a été prise en compte",
      });
    } catch (error: any) {
      console.error('Error confirming transaction:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction || !listing) {
    return <div>Chargement...</div>;
  }

  const isBuyer = address?.toLowerCase() === transaction.buyer.wallet_address?.toLowerCase();
  const isSeller = address?.toLowerCase() === transaction.seller.wallet_address?.toLowerCase();
  const canConfirm = transaction.funds_secured && (isBuyer || isSeller);
  const hasConfirmed = (isBuyer && transaction.buyer_confirmation) || 
                      (isSeller && transaction.seller_confirmation);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Système d'escrow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cette transaction est sécurisée par notre système d'escrow. Les fonds seront libérés une fois que l'acheteur et le vendeur auront confirmé la transaction.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p>Statut : {transaction.escrow_status}</p>
          <p>Fonds sécurisés : {transaction.funds_secured ? 'Oui' : 'Non'}</p>
          <p>Confirmation acheteur : {transaction.buyer_confirmation ? 'Oui' : 'Non'}</p>
          <p>Confirmation vendeur : {transaction.seller_confirmation ? 'Oui' : 'Non'}</p>
        </div>

        {!transaction.funds_secured ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Le paiement n'a pas encore été effectué. Veuillez procéder au paiement avant de confirmer la réception.
              </AlertDescription>
            </Alert>
            
            {isBuyer && (
              <CryptoPaymentForm
                listingId={listing.id}
                title={listing.title}
                price={listing.price}
                cryptoAmount={listing.crypto_amount}
                cryptoCurrency={listing.crypto_currency}
                onPaymentComplete={() => {
                  toast({
                    title: "Paiement effectué",
                    description: "Les fonds ont été sécurisés avec succès",
                  });
                }}
              />
            )}
          </>
        ) : (
          <Button 
            onClick={handleConfirmation} 
            disabled={!canConfirm || hasConfirmed || isLoading}
            className="w-full"
          >
            {isLoading ? "En cours..." : 
             hasConfirmed ? "Confirmation envoyée" : 
             "Confirmer la réception"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}