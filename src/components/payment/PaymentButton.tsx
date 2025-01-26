import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { amoy } from '@/config/chains';
import { useToast } from "@/components/ui/use-toast";
import { ethers } from 'ethers';
import { ESCROW_ABI } from "@/hooks/escrow/escrowConstants";

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
      const buyerAddress = await signer.getAddress();

      // 3. Vérifier que l'acheteur est différent du vendeur
      if (buyerAddress.toLowerCase() === sellerAddress.toLowerCase()) {
        throw new Error("L'acheteur et le vendeur doivent être différents");
      }

      // 4. Préparer le montant avec une précision fixe de 18 décimales
      console.log('Converting amount to Wei:', cryptoAmount);
      const formattedAmount = cryptoAmount.toFixed(18); // Fix decimal precision
      console.log('Formatted amount:', formattedAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);
      console.log('Amount in Wei:', amountInWei.toString());
      
      // 5. Vérifier le solde
      const balance = await provider.getBalance(buyerAddress);
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour le paiement");
      }

      // 6. Configurer le contract
      const contractAddress = "0x9d0e51B31426A734162364Cde425e2A44D944A01";
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, signer);

      console.log('Creating escrow transaction:', {
        sellerAddress,
        amount: ethers.utils.formatEther(amountInWei),
        buyerAddress
      });

      // 7. Créer la transaction
      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei,
        gasLimit: ethers.BigNumber.from("300000")
      });

      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

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