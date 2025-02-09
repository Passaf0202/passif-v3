
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
  sellerAddress?: string;
  transactionId?: string | null;
  contractAddress?: string;
  mode?: 'pay' | 'release';
}

export function PaymentButton({ 
  isProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency = 'BNB',
  onClick,
  disabled = false,
  sellerAddress,
  transactionId,
  contractAddress,
  mode = 'pay'
}: PaymentButtonProps) {
  const { toast } = useToast();
  const { isWrongNetwork, ensureCorrectNetwork } = useNetworkSwitch();

  const handleClick = async () => {
    if (!isConnected) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre wallet",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'release' && (!transactionId || !contractAddress)) {
      toast({
        title: "Erreur",
        description: "Informations de transaction manquantes",
        variant: "destructive",
      });
      return;
    }

    try {
      await ensureCorrectNetwork();
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

  const getButtonText = () => {
    if (isProcessing) {
      return "Transaction en cours...";
    }
    if (disabled) {
      return "Transaction en attente de confirmation...";
    }
    if (isWrongNetwork) {
      return "Changer vers Polygon Amoy";
    }
    if (!isConnected) {
      return "Connecter votre wallet";
    }
    if (mode === 'release') {
      return "Confirmer la réception";
    }
    return `Payer ${cryptoAmount?.toFixed(6)} ${cryptoCurrency}`;
  };

  if (!sellerAddress && mode === 'pay') {
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
        disabled={isProcessing || !isConnected || (mode === 'pay' && !cryptoAmount) || disabled}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transaction en cours...
          </>
        ) : (
          getButtonText()
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
