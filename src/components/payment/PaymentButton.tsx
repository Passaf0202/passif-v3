
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { usePaymentTransaction } from "@/hooks/usePaymentTransaction";
import { useNavigate } from "react-router-dom";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
  sellerAddress?: string;
  listingId: string;
}

export function PaymentButton({ 
  isProcessing: externalIsProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency = 'POL',
  onClick,
  disabled = false,
  sellerAddress,
  listingId
}: PaymentButtonProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isWrongNetwork, ensureCorrectNetwork } = useNetworkSwitch();
  const { handlePayment, isProcessing } = usePaymentTransaction({
    listingId,
    address: sellerAddress,
    onPaymentComplete: (transactionId: string) => {
      onClick();
      navigate(`/payment/${transactionId}`);
    }
  });

  const handleClick = async () => {
    if (!isConnected || !sellerAddress || !cryptoAmount || !listingId) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre wallet et vérifier les informations de paiement",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. S'assurer d'être sur le bon réseau avant tout
      await ensureCorrectNetwork();

      // 2. Lancer le processus de paiement
      await handlePayment();

    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Erreur de transaction",
        description: error.message || "La transaction a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const buttonDisabled = isProcessing || externalIsProcessing || !isConnected || !cryptoAmount || disabled || !sellerAddress || !listingId;

  return (
    <div className="w-full space-y-2">
      <Button 
        onClick={handleClick} 
        disabled={buttonDisabled}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isProcessing || externalIsProcessing ? (
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
          `Payer ${cryptoAmount?.toFixed(6)} POL sur Polygon Amoy`
        )}
      </Button>

      {!isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez connecter votre portefeuille pour effectuer le paiement
        </p>
      )}

      {isWrongNetwork && isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez vous connecter au réseau Polygon Amoy pour payer en POL
        </p>
      )}
    </div>
  );
}
