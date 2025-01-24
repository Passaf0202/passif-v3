import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork, useAccount } from 'wagmi';
import { amoy } from '@/config/chains';
import { useToast } from "@/components/ui/use-toast";
import { useEscrowContract } from "@/hooks/escrow/useEscrowContract";
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
  const { deployNewContract } = useEscrowContract();

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

    if (!cryptoAmount || !sellerAddress) {
      toast({
        title: "Erreur",
        description: "Informations de paiement manquantes",
        variant: "destructive",
      });
      return;
    }

    try {
      if (chain?.id !== amoy.id) {
        toast({
          title: "Changement de réseau",
          description: "Veuillez confirmer le changement vers Polygon Amoy",
        });
        
        if (switchNetwork) {
          try {
            await switchNetwork(amoy.id);
          } catch (error) {
            console.error('Error switching network:', error);
            toast({
              title: "Erreur de réseau",
              description: "Impossible de changer vers Polygon Amoy. Veuillez le faire manuellement.",
              variant: "destructive",
            });
            return;
          }
        } else {
          toast({
            title: "Erreur",
            description: "Veuillez changer manuellement vers le réseau Polygon Amoy",
            variant: "destructive",
          });
          return;
        }
      }

      console.log('Deploying escrow contract with params:', {
        seller: sellerAddress,
        amount: cryptoAmount,
        network: chain.name
      });

      // Convertir le montant en wei avec 18 décimales maximum
      const amountInWei = parseEther(cryptoAmount.toFixed(18));
      
      const { contract, receipt } = await deployNewContract(
        sellerAddress,
        amountInWei
      );

      console.log('Escrow contract deployed:', {
        address: contract.address,
        transactionHash: receipt.transactionHash
      });

      if (receipt.status === 1) {
        toast({
          title: "Transaction envoyée",
          description: "Les fonds ont été bloqués dans le contrat d'escrow",
        });
        onClick();
      } else {
        throw new Error("La transaction a échoué sur la blockchain");
      }

    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Erreur de transaction",
        description: error.message || "La transaction a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const wrongNetwork = chain?.id !== amoy.id;
  const isSameAddress = address === sellerAddress;

  // Calcul de l'état disabled du bouton
  const isDisabled = isProcessing || !isConnected || !cryptoAmount || isSameAddress;

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