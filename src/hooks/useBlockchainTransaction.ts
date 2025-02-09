
import { ethers } from "ethers";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";
const ESCROW_ABI = [
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "function transactionCount() view returns (uint256)",
  "function cancelTransaction(uint256 txnId)"
];

export const useBlockchainTransaction = (transactionId: string) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();

  const handleCancelTransaction = async (transaction: any, userId: string) => {
    if (!transaction?.blockchain_txn_id) {
      toast({
        title: "Erreur",
        description: "Impossible de trouver l'ID de la transaction blockchain",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCancelling(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      const tx = await contract.cancelTransaction(transaction.blockchain_txn_id);
      console.log("Transaction d'annulation envoyée:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction d'annulation confirmée:", receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            cancelled_at: new Date().toISOString(),
            cancelled_by: userId,
            status: "cancelled",
            escrow_status: "cancelled"
          })
          .eq("id", transactionId);

        if (updateError) {
          throw updateError;
        }

        toast({
          title: "Succès",
          description: "La transaction a été annulée avec succès",
        });

        return true;
      }
    } catch (error: any) {
      console.error("Erreur lors de l'annulation:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'annulation",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }

    return false;
  };

  return {
    isCancelling,
    handleCancelTransaction
  };
};
