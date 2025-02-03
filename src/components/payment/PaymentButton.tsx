import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { amoy } from '@/config/chains';
import { useToast } from "@/components/ui/use-toast";
import { ethers } from 'ethers';
import { supabase } from "@/integrations/supabase/client";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
  sellerAddress?: string;
  transactionId?: string;
}

const ESCROW_ABI = [
  "function createTransaction(address seller) payable returns (uint256)",
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "function transactionCount() view returns (uint256)",
  "event TransactionCreated(uint256 indexed txnId, address buyer, address seller, uint256 amount)"
];

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
      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const buyerAddress = await signer.getAddress();

      if (buyerAddress.toLowerCase() === sellerAddress.toLowerCase()) {
        throw new Error("L'acheteur et le vendeur doivent être différents");
      }

      console.log('Converting amount to Wei:', cryptoAmount);
      const formattedAmount = cryptoAmount.toFixed(18);
      console.log('Formatted amount:', formattedAmount);
      const amountInWei = ethers.utils.parseEther(formattedAmount);
      console.log('Amount in Wei:', amountInWei.toString());
      
      const balance = await provider.getBalance(buyerAddress);
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour le paiement");
      }

      const contractAddress = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, signer);

      console.log('Creating transaction with params:', {
        seller: sellerAddress,
        amount: ethers.utils.formatEther(amountInWei),
      });

      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei,
        gasLimit: 300000
      });

      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        // Récupérer le txnId en utilisant transactionCount
        const txnCount = await contract.transactionCount();
        console.log("Transaction count:", txnCount.toString());
        const txnId = txnCount.sub(1);
        console.log("Transaction ID:", txnId.toString());

        // Vérifier que la transaction existe
        const txData = await contract.getTransaction(txnId);
        console.log("Transaction data:", txData);

        // Stocker le txnId dans le localStorage
        if (transactionId) {
          localStorage.setItem(`txnId_${transactionId}`, txnId.toString());
          console.log("Stored txnId in localStorage:", txnId.toString());

          // Mettre à jour la transaction dans Supabase
          const { error: updateError } = await supabase
            .from('transactions')
            .update({ 
              blockchain_txn_id: txnId.toString(),
              transaction_hash: tx.hash,
              funds_secured: true,
              funds_secured_at: new Date().toISOString()
            })
            .eq('id', transactionId);

          if (updateError) {
            console.error('Error updating transaction:', updateError);
            throw new Error("Erreur lors de la mise à jour de la transaction");
          }
        }
        
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
  const buttonDisabled = isProcessing || !isConnected || !cryptoAmount || disabled || !sellerAddress;

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
        ) : !isConnected ? (
          "Connecter votre wallet"
        ) : !sellerAddress ? (
          "Adresse du vendeur manquante"
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