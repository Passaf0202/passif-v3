
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
      console.log("[useEscrowDetailsTransaction] Fetching transaction details for UUID:", transactionId);
      
      const txnData = await fetchFromSupabase(transactionId);
      console.log("[useEscrowDetailsTransaction] Transaction data successfully fetched:", txnData);

      if (!txnData) {
        console.error("[useEscrowDetailsTransaction] No transaction found for ID:", transactionId);
        throw new Error("Transaction non trouvée");
      }

      // Log all transaction data for debugging
      console.log("[useEscrowDetailsTransaction] Full transaction data:", {
        id: txnData.id,
        status: txnData.status,
        escrow_status: txnData.escrow_status,
        buyer_id: txnData.buyer_id,
        seller_id: txnData.seller_id,
        listing_id: txnData.listing_id,
        blockchain_txn_id: txnData.blockchain_txn_id,
      });

      if (!txnData.blockchain_txn_id) {
        console.error("[useEscrowDetailsTransaction] No blockchain transaction ID found");
        throw new Error("ID de transaction blockchain manquant");
      }

      // Format the transaction data
      const formattedTransaction: Transaction = {
        ...txnData,
        listing_title: txnData.listing?.title || txnData.listing_title || 'N/A'
      };

      setTransaction(formattedTransaction);
    } catch (error: any) {
      console.error("[useEscrowDetailsTransaction] Error in fetchTransaction:", error);
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
