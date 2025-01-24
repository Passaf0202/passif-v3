import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { amoy } from '@/config/chains';
import { useToast } from "@/components/ui/use-toast";
import { ethers } from 'ethers';
import { ESCROW_ABI, ESCROW_BYTECODE } from "@/hooks/escrow/escrowConstants";

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
    if (!isConnected || !sellerAddress || !cryptoAmount) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre wallet et vérifier les informations de paiement",
        variant: "destructive",
      });
      return;
    }

    if (chain?.id !== amoy.id) {
      try {
        if (switchNetwork) {
          await switchNetwork(amoy.id);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error switching network:', error);
        toast({
          title: "Erreur de réseau",
          description: "Veuillez changer manuellement vers le réseau Polygon Amoy",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      console.log('Initiating transaction...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const roundedAmount = Number(Math.abs(cryptoAmount).toFixed(8));
      const amountInWei = ethers.utils.parseEther(roundedAmount.toString());
      
      console.log('Transaction details:', {
        amount: roundedAmount,
        amountInWei: amountInWei.toString(),
        seller: sellerAddress
      });

      // Vérifier le solde
      const balance = await provider.getBalance(await signer.getAddress());
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour le paiement");
      }

      // Configuration optimisée du gas
      const gasPrice = await provider.getGasPrice();
      const gasLimit = ethers.BigNumber.from("1000000"); // Réduit à 1M
      const estimatedGasCost = gasLimit.mul(gasPrice);
      
      console.log('Gas configuration:', {
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        gasLimit: gasLimit.toString(),
        estimatedCost: ethers.utils.formatEther(estimatedGasCost)
      });

      // Vérifier le coût total
      const totalCost = amountInWei.add(estimatedGasCost);
      if (balance.lt(totalCost)) {
        throw new Error("Solde insuffisant pour couvrir les frais de transaction");
      }

      // Créer et déployer le contrat avec des paramètres simplifiés
      const factory = new ethers.ContractFactory(ESCROW_ABI, ESCROW_BYTECODE, signer);
      
      console.log('Deploying contract...');
      const escrowContract = await factory.deploy(
        sellerAddress,
        await signer.getAddress(),
        ethers.constants.AddressZero,
        5,
        {
          value: amountInWei,
          gasLimit,
          gasPrice
        }
      );

      console.log('Waiting for deployment...', escrowContract.deployTransaction.hash);
      const receipt = await escrowContract.deployTransaction.wait();
      
      if (receipt.status === 1) {
        console.log('Contract deployed successfully at:', escrowContract.address);
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