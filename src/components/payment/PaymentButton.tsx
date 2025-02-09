
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { usePaymentTransaction } from "@/hooks/usePaymentTransaction";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
  sellerAddress?: string;
  transactionId?: string | null;
}

export function PaymentButton({ 
  isProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency = 'BNB',
  onClick,
  disabled = false,
  sellerAddress,
  transactionId
}: PaymentButtonProps) {
  const { toast } = useToast();
  const { isWrongNetwork, ensureCorrectNetwork } = useNetworkSwitch();
  const { createTransaction } = usePaymentTransaction();

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
      console.log("Processing transaction with seller address:", sellerAddress);
      
      await createTransaction(sellerAddress, cryptoAmount, transactionId);

      toast({
        title: "Transaction réussie",
        description: "Les fonds ont été bloqués dans le contrat d'escrow",
      });
      onClick();

    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Erreur de transaction",
        description: error.message || "La transaction a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  if (!sellerAddress) {
    return (
      <Button disabled className="w-full">
        Adresse du vendeur manquante
      </Button>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Button 
        onClick={handleClick} 
        disabled={isProcessing || !isConnected || !cryptoAmount || disabled}
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
