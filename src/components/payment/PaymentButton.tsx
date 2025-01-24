import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { amoy } from '@/config/chains';
import { useToast } from "@/components/ui/use-toast";
import { ethers } from 'ethers';
import { ESCROW_ABI, ESCROW_BYTECODE, formatAmount } from "@/hooks/escrow/escrowConstants";

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
  const { switchNetwork, isLoading: isSwitching } = useSwitchNetwork();
  const { toast } = useToast();

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
        description: "Changement vers le réseau Polygon Amoy...",
      });
      
      try {
        if (switchNetwork) {
          await switchNetwork(amoy.id);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
      } catch (error) {
        console.error('Error switching network:', error);
        toast({
          title: "Erreur de réseau",
          description: "Veuillez changer manuellement vers le réseau Polygon Amoy dans MetaMask",
          variant: "destructive",
        });
        return;
      }
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
      console.log('Initiating transaction with params:', {
        to: sellerAddress,
        value: cryptoAmount,
        network: chain?.name,
        chainId: chain?.id
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const platformAddress = await signer.getAddress(); // Pour le test, on utilise l'adresse du signeur comme plateforme
      const platformFeePercent = 5; // 5% de frais de plateforme

      const factory = new ethers.ContractFactory(
        ESCROW_ABI,
        ESCROW_BYTECODE,
        signer
      );

      const amountInWei = ethers.utils.parseEther(cryptoAmount.toFixed(18));
      
      // Déploiement avec tous les arguments requis
      const escrowContract = await factory.deploy(
        sellerAddress,
        platformAddress,
        ethers.constants.AddressZero, // Token address (0x0 pour MATIC natif)
        platformFeePercent,
        { value: amountInWei }
      );

      console.log('Waiting for deployment transaction:', escrowContract.deployTransaction.hash);
      
      const receipt = await escrowContract.deployTransaction.wait();
      console.log('Deployment receipt:', receipt);

      if (receipt.status === 1) {
        toast({
          title: "Transaction réussie",
          description: "Les fonds ont été bloqués dans le contrat d'escrow",
        });
        onClick();
      } else {
        throw new Error("La transaction a échoué");
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
  const buttonDisabled = isProcessing || !isConnected || !cryptoAmount || disabled || isSwitching;

  return (
    <div className="w-full space-y-2">
      <Button 
        onClick={handleClick} 
        disabled={buttonDisabled}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isProcessing || isSwitching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isSwitching ? "Changement de réseau..." : "Transaction en cours..."}
          </>
        ) : disabled ? (
          "Transaction en attente de confirmation..."
        ) : wrongNetwork ? (
          "Changer vers Polygon Amoy"
        ) : (
          `Payer ${cryptoAmount?.toFixed(6)} ${cryptoCurrency}`
        )}
      </Button>

      {!isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez connecter votre portefeuille pour effectuer le paiement
        </p>
      )}

      {wrongNetwork && isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez vous connecter au réseau Polygon Amoy
        </p>
      )}
    </div>
  );
}