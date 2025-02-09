
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useContractInteraction } from "./useContractInteraction";

export function useEscrowRelease(transactionId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { releaseFunds } = useContractInteraction();

  const handleReleaseFunds = async () => {
    try {
      setIsLoading(true);
      const receipt = await releaseFunds(transactionId);

      if (receipt.status === 1) {
        toast({
          title: "Confirmation réussie",
          description: "Les fonds ont été libérés au vendeur.",
        });
      } else {
        throw new Error("La libération des fonds a échoué");
      }
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
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
