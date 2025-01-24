import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork, useAccount, usePrepareSendTransaction, useSendTransaction } from 'wagmi';
import { amoy } from '@/config/chains';
import { useToast } from "@/components/ui/use-toast";
import { parseEther } from "viem";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  sellerAddress?: string;
}

export function PaymentButton({ 
  isProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency = 'MATIC',
  onClick,
  sellerAddress
}: PaymentButtonProps) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address } = useAccount();
  const { toast } = useToast();

  // Préparation de la transaction
  const { config } = usePrepareSendTransaction({
    to: sellerAddress as `0x${string}`,
    value: cryptoAmount ? parseEther(cryptoAmount.toFixed(18)) : BigInt(0),
    enabled: !!sellerAddress && !!cryptoAmount && isConnected,
  });

  const { sendTransaction } = useSendTransaction(config);

  const handleClick = async () => {
    console.log('Payment button clicked with params:', {
      isConnected,
      chain,
      sellerAddress,
      cryptoAmount,
      currentNetwork: chain?.id,
      targetNetwork: amoy.id
    });

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
      console.log('Sending transaction with params:', {
        to: sellerAddress,
        value: cryptoAmount,
        network: chain.name
      });

      if (sendTransaction) {
        await sendTransaction();
        toast({
          title: "Transaction envoyée",
          description: "Votre paiement est en cours de traitement",
        });
        onClick();
      }

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
  const isSameAddress = address === sellerAddress;

  // Calcul de l'état disabled du bouton
  const isDisabled = isProcessing || !isConnected || !cryptoAmount || wrongNetwork || isSameAddress;

  return (
    <div className="w-full">
      <Button 
        onClick={handleClick} 
        disabled={isDisabled}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transaction en cours...
          </>
        ) : wrongNetwork ? (
          "Veuillez vous connecter au réseau Polygon Amoy"
        ) : isSameAddress ? (
          "Vous ne pouvez pas acheter votre propre article"
        ) : (
          `Payer ${cryptoAmount?.toFixed(6)} ${cryptoCurrency}`
        )}
      </Button>

      {!isConnected && (
        <p className="text-sm text-red-500 text-center mt-2">
          Veuillez connecter votre portefeuille pour effectuer le paiement
        </p>
      )}

      {wrongNetwork && isConnected && (
        <p className="text-sm text-red-500 text-center mt-2">
          Veuillez vous connecter au réseau Polygon Amoy dans votre portefeuille
        </p>
      )}

      {isSameAddress && isConnected && (
        <p className="text-sm text-red-500 text-center mt-2">
          Vous ne pouvez pas acheter votre propre article
        </p>
      )}
    </div>
  );
}