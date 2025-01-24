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
  const { switchNetwork } = useSwitchNetwork();
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

    try {
      // 1. Vérifier et changer le réseau si nécessaire
      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 2. Initialiser le provider et le signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // 3. Préparer le montant avec une valeur minimale pour tester
      const testAmount = "0.001";
      const amountInWei = ethers.utils.parseEther(testAmount);
      
      // 4. Vérifier le solde
      const balance = await provider.getBalance(await signer.getAddress());
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour le paiement");
      }

      // 5. Configurer le gas de manière conservative
      const gasPrice = await provider.getGasPrice();
      const gasLimit = ethers.BigNumber.from("300000");
      const estimatedGasCost = gasLimit.mul(gasPrice);
      const totalCost = amountInWei.add(estimatedGasCost);

      if (balance.lt(totalCost)) {
        throw new Error("Solde insuffisant pour couvrir les frais de transaction");
      }

      // 6. Déployer le contrat avec configuration minimale
      const factory = new ethers.ContractFactory(ESCROW_ABI, ESCROW_BYTECODE, signer);
      console.log('Deploying contract with minimal params:', {
        seller: sellerAddress,
        value: ethers.utils.formatEther(amountInWei)
      });

      const escrowContract = await factory.deploy(
        sellerAddress,
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
  const buttonDisabled = isProcessing || !isConnected || !cryptoAmount || disabled;

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