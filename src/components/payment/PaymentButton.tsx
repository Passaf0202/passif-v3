import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork, useAccount, usePrepareSendTransaction, useSendTransaction } from 'wagmi';
import { amoy } from 'viem/chains';
import { useToast } from "@/components/ui/use-toast";
import { parseEther } from 'viem';

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
  sellerAddress?: string;
}

export function PaymentButton({ 
  isProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency = 'MATIC',
  onClick,
  disabled = false,
  sellerAddress
}: PaymentButtonProps) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address } = useAccount();
  const { toast } = useToast();

  const { config } = usePrepareSendTransaction({
    to: sellerAddress,
    value: cryptoAmount ? parseEther(cryptoAmount.toString()) : undefined,
    enabled: !!sellerAddress && !!cryptoAmount,
  });

  const { sendTransaction } = useSendTransaction(config);

  const handleClick = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet non connecté",
        description: "Veuillez connecter votre wallet pour continuer",
        variant: "destructive",
      });
      return;
    }

    if (chain?.id !== amoy.id) {
      toast({
        title: "Mauvais réseau",
        description: "Veuillez vous connecter au réseau Polygon Amoy",
      });
      
      if (switchNetwork) {
        try {
          await switchNetwork(amoy.id);
        } catch (error) {
          console.error('Error switching network:', error);
          return;
        }
      }
      return;
    }

    if (!cryptoAmount || !sellerAddress) {
      toast({
        title: "Erreur",
        description: "Informations de paiement manquantes",
        variant: "destructive",
      });
      return;
    }

    try {
      if (sendTransaction) {
        await sendTransaction();
      }
      onClick();
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Erreur de transaction",
        description: "La transaction a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const wrongNetwork = chain?.id !== amoy.id;

  return (
    <>
      <Button 
        onClick={handleClick} 
        disabled={isProcessing || !isConnected || !cryptoAmount || disabled || wrongNetwork}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transaction en cours...
          </>
        ) : disabled ? (
          "Transaction en attente de confirmation..."
        ) : wrongNetwork ? (
          "Veuillez vous connecter au réseau Polygon Amoy"
        ) : (
          `Payer ${cryptoAmount?.toFixed(6)} ${cryptoCurrency}`
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
          Veuillez vous connecter au réseau Polygon Amoy dans votre portefeuille
        </p>
      )}
    </>
  );
}