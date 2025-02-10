
import { useState } from "react";
import { Transaction } from "../types/escrow";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseTransaction } from "./useSupabaseTransaction";
import { useBlockchainTransaction } from "./useBlockchainTransaction";

export const useEscrowDetailsTransaction = (transactionId: string) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  const { fetchFromSupabase } = useSupabaseTransaction();
  const { getBlockchainTransaction } = useBlockchainTransaction();

  const fetchTransaction = async () => {
    try {
      setIsFetching(true);
      console.log("Fetching transaction:", transactionId);
      
      const txnData = await fetchFromSupabase(transactionId);
      console.log("Transaction data from Supabase:", txnData);

      if (!txnData) {
        throw new Error("Transaction non trouvée");
      }

      setTransaction(txnData);
    } catch (error: any) {
      console.error("Error in fetchTransaction:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  return {
    transaction,
    isLoading,
    setIsLoading,
    isFetching,
    fetchTransaction
  };
};
