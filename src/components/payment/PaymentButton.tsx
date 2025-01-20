import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { useToast } from "@/components/ui/use-toast";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
}

export function PaymentButton({ 
  isProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency = 'BNB',
  onClick,
  disabled = false
}: PaymentButtonProps) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { toast } = useToast();

  const handleClick = async () => {
    if (chain?.id !== bscTestnet.id) {
      toast({
        title: "Mauvais réseau",
        description: "Veuillez vous connecter au réseau BSC Testnet pour continuer",
      });
      
      if (switchNetwork) {
        try {
          await switchNetwork(bscTestnet.id);
        } catch (error) {
          console.error('Error switching network:', error);
          return;
        }
      }
      return;
    }
    
    onClick();
  };

  const wrongNetwork = chain?.id !== bscTestnet.id;

  return (
    <>
      <Button 
        onClick={handleClick} 
        disabled={isProcessing || !isConnected || !cryptoAmount || disabled || wrongNetwork}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transaction en cours...
          </>
        ) : disabled ? (
          "Transaction en attente de confirmation..."
        ) : wrongNetwork ? (
          "Veuillez vous connecter au réseau BSC Testnet"
        ) : (
          `Payer avec ${cryptoAmount?.toFixed(6)} ${cryptoCurrency}`
        )}
      </Button>

      {!isConnected && (
        <p className="text-sm text-red-500 text-center mt-2">
          Veuillez connecter votre portefeuille pour effectuer le paiement
        </p>
      )}

      {!cryptoAmount && (
        <p className="text-sm text-red-500 text-center mt-2">
          Le montant en crypto n'est pas disponible pour le moment
        </p>
      )}

      {wrongNetwork && (
        <p className="text-sm text-red-500 text-center mt-2">
          Veuillez vous connecter au réseau BSC Testnet dans votre portefeuille
        </p>
      )}
    </>
  );
}