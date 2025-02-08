
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";

const ESCROW_ABI = [
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "function owner() view returns (address)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

interface EscrowStatusProps {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  currentUserId: string;
}

export function EscrowStatus({
  transactionId,
  buyerId,
  sellerId,
  currentUserId,
}: EscrowStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isUserBuyer = currentUserId === buyerId;
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('blockchain_txn_id, buyer_confirmation, funds_secured, funds_secured_at')
        .eq('id', transactionId)
        .single();

      if (txError || !transaction) {
        console.error('Error fetching transaction:', txError);
        throw new Error("Transaction non trouvée");
      }

      if (!transaction.funds_secured || !transaction.funds_secured_at) {
        throw new Error("Les fonds n'ont pas encore été sécurisés pour cette transaction");
      }

      if (transaction.buyer_confirmation) {
        throw new Error("Vous avez déjà confirmé cette transaction");
      }

      if (!transaction.blockchain_txn_id || transaction.blockchain_txn_id === "0") {
        throw new Error("ID de transaction blockchain invalide ou manquant");
      }

      const txnId = Number(transaction.blockchain_txn_id);
      if (isNaN(txnId) || txnId === 0) {
        console.error('Invalid blockchain transaction ID:', transaction.blockchain_txn_id);
        throw new Error("ID de transaction blockchain invalide");
      }

      console.log('Using blockchain transaction ID:', txnId);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log('Signer address:', signerAddress);
      
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      const txData = await contract.getTransaction(txnId);
      console.log('Transaction data:', txData);

      if (!txData) {
        throw new Error("Transaction non trouvée sur la blockchain");
      }

      if (txData.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("Vous n'êtes pas l'acheteur de cette transaction");
      }

      if (txData.buyerConfirmed) {
        throw new Error("Vous avez déjà confirmé cette transaction");
      }

      const gasEstimate = await contract.estimateGas.confirmTransaction(txnId);
      console.log('Estimated gas:', gasEstimate.toString());

      const gasLimit = gasEstimate.mul(120).div(100);
      console.log('Gas limit with 20% margin:', gasLimit.toString());

      const tx = await contract.confirmTransaction(txnId, {
        gasLimit: gasLimit
      });
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        const { error } = await supabase
          .from('transactions')
          .update({
            buyer_confirmation: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (error) throw error;

        toast({
          title: "Confirmation réussie",
          description: "Les fonds seront libérés une fois que le vendeur aura également confirmé.",
        });
      } else {
        throw new Error("La confirmation sur la blockchain a échoué");
      }
    } catch (error: any) {
      console.error("Error confirming transaction:", error);
      let errorMessage = "Une erreur est survenue lors de la confirmation";
      
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = "Erreur d'estimation du gas. La transaction n'est peut-être pas valide.";
      } else if (error.message.includes('execution reverted')) {
        errorMessage = "Transaction rejetée : vérifiez que vous êtes bien l'acheteur et que la transaction existe.";
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = "Fonds insuffisants pour payer les frais de transaction.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          {isUserBuyer
            ? "En tant qu'acheteur, vous pouvez confirmer la réception de l'article pour libérer les fonds."
            : "En tant que vendeur, vous recevrez les fonds une fois que l'acheteur aura confirmé la réception."}
        </AlertDescription>
      </Alert>

      {isUserBuyer && (
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Confirmation en cours..." : "Confirmer la réception"}
        </Button>
      )}
    </div>
  );
}
