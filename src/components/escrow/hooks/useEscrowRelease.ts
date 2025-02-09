
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useContractInteraction } from "./useContractInteraction";
import { updateTransactionStatus, getBlockchainTxnId } from "./useTransactionUpdate";

export function useEscrowRelease(transactionId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { releaseFunds } = useContractInteraction();

  const handleReleaseFunds = async () => {
    try {
      setIsLoading(true);

      const txnId = await getBlockchainTxnId(transactionId);
      const receipt = await releaseFunds(txnId);

      if (receipt.status === 1) {
        await updateTransactionStatus(transactionId);
        
        toast({
          title: "Confirmation réussie",
          description: "Les fonds ont été libérés au vendeur.",
        });
      } else {
        throw new Error("La libération des fonds a échoué");
      }
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      let errorMessage = "Une erreur est survenue lors de la libération des fonds";
      
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

  return {
    isLoading,
    handleReleaseFunds
  };
}
