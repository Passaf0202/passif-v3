
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_ABI = [
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "function transactionCount() view returns (uint256)",
  "event TransactionCreated(uint256 indexed txnId, address buyer, address seller, uint256 amount)"
];

const contractAddress = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export const useEscrowTransaction = (transactionId: string) => {
  const [status, setStatus] = useState<string>("pending");
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [fundsSecured, setFundsSecured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStoredTxnId = async (): Promise<string> => {
    try {
      // D'abord, essayer de récupérer depuis Supabase
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('blockchain_txn_id')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      
      if (transaction?.blockchain_txn_id) {
        console.log("Retrieved blockchain_txn_id from Supabase:", transaction.blockchain_txn_id);
        return transaction.blockchain_txn_id;
      }

      // Si pas dans Supabase, essayer localStorage
      const storedId = localStorage.getItem(`txnId_${transactionId}`);
      console.log("Retrieved stored txnId from localStorage:", storedId);
      
      if (storedId) {
        // Synchroniser avec Supabase si trouvé dans localStorage
        await supabase
          .from('transactions')
          .update({ blockchain_txn_id: storedId })
          .eq('id', transactionId);
          
        return storedId;
      }

      throw new Error("ID de transaction non trouvé");
    } catch (error) {
      console.error("Error getting transaction ID:", error);
      throw new Error("ID de transaction non trouvé");
    }
  };

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("escrow_status, buyer_confirmation, seller_confirmation, funds_secured, transaction_hash")
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Error fetching transaction status:", error);
        return;
      }

      console.log("Transaction data:", data);
      setStatus(data.escrow_status);
      setFundsSecured(data.funds_secured);
    };

    fetchTransactionStatus();

    const subscription = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          console.log("Transaction updated:", payload);
          setStatus(payload.new.escrow_status);
          setFundsSecured(payload.new.funds_secured);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId]);

  return {
    status,
    hasConfirmed,
    fundsSecured,
    isLoading,
    setIsLoading,
    getStoredTxnId,
    setHasConfirmed
  };
};
