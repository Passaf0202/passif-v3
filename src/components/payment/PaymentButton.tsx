
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { usePaymentTransaction } from "@/hooks/usePaymentTransaction";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReleaseFunds } from "@/hooks/escrow/useReleaseFunds";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
  sellerAddress?: string;
  transactionId?: string;
}

export function PaymentButton({ 
  isProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency = 'POL',
  onClick,
  disabled = false,
  sellerAddress,
  transactionId
}: PaymentButtonProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isWrongNetwork, ensureCorrectNetwork } = useNetworkSwitch();
  const { handlePayment } = usePaymentTransaction();
  const [showReleaseFunds, setShowReleaseFunds] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(true);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!transactionId) return;

      try {
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
          .eq('id', transactionId)
          .single();

        if (error) {
          console.error("Error fetching transaction:", error);
          return;
        }

        if (transaction) {
          setTransactionDetails(transaction);
          setShowReleaseFunds(!!transaction.funds_secured);
        }
      } catch (error) {
        console.error("Error in fetchTransactionDetails:", error);
      } finally {
        setIsLoadingTransaction(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  const { isReleasing, handleReleaseFunds } = useReleaseFunds(
    transactionId || '',
    transactionDetails?.blockchain_txn_id,
    sellerAddress
  );

  const handleClick = async () => {
    if (!isConnected || !sellerAddress || !cryptoAmount) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre wallet et vérifier les informations de paiement",
        variant: "destructive",
      });
      return;
    }

    try {
      await ensureCorrectNetwork();

      const txHash = await handlePayment(sellerAddress, cryptoAmount, transactionId);
      console.log('Transaction successful:', txHash);

      onClick();
      setShowReleaseFunds(true);

    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Erreur de transaction",
        description: error.message || "La transaction a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const buttonDisabled = isProcessing || !isConnected || !cryptoAmount || disabled || !sellerAddress;

  if (showReleaseFunds && transactionDetails) {
    return (
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
    );
  }

  return (
    <div className="w-full space-y-2">
      <Button 
        onClick={handleClick} 
        disabled={buttonDisabled}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transaction en cours...
          </>
        ) : disabled ? (
          "Transaction en attente de confirmation..."
        ) : isWrongNetwork ? (
          "Changer vers Polygon Amoy"
        ) : !isConnected ? (
          "Connecter votre wallet"
        ) : !sellerAddress ? (
          "Adresse du vendeur manquante"
        ) : (
          `Payer ${cryptoAmount?.toFixed(6)} ${cryptoCurrency}`
        )}
      </Button>

      {!isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez connecter votre portefeuille pour effectuer le paiement
        </p>
      )}

      {isWrongNetwork && isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez vous connecter au réseau Polygon Amoy
        </p>
      )}
    </div>
  );
}
