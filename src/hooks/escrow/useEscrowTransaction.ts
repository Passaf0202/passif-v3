
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
      console.log("Getting stored transaction ID for:", transactionId);
      
      // Try to get from Supabase first
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('blockchain_txn_id, transaction_hash')
        .eq('id', transactionId)
        .single();

      if (error) {
        console.error("Error fetching from Supabase:", error);
        throw error;
      }
      
      if (transaction?.blockchain_txn_id) {
        console.log("Found blockchain_txn_id in Supabase:", transaction.blockchain_txn_id);
        return transaction.blockchain_txn_id.toString();
      }

      // If not in Supabase, try localStorage
      const storedId = localStorage.getItem(`txnId_${transactionId}`);
      console.log("Checking localStorage:", storedId);
      
      if (storedId) {
        // Sync with Supabase if found in localStorage
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ blockchain_txn_id: Number(storedId) })
          .eq('id', transactionId);

        if (updateError) {
          console.error("Error updating Supabase:", updateError);
        }
        
        return storedId;
      }

      // If still not found, try to fetch from blockchain
      console.log("Attempting to fetch from blockchain...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, provider);
      
      const txnCount = await contract.transactionCount();
      console.log("Current transaction count:", txnCount.toString());
      
      // Look through recent transactions
      for (let i = txnCount.sub(1); i.gte(0) && i.gte(txnCount.sub(10)); i = i.sub(1)) {
        const txData = await contract.getTransaction(i);
        console.log(`Checking transaction ${i}:`, txData);
        
        if (txData.amount.gt(0)) {
          // Store found ID
          const foundId = i.toString();
          console.log("Found valid transaction ID:", foundId);
          
          await supabase
            .from('transactions')
            .update({ blockchain_txn_id: Number(foundId) })
            .eq('id', transactionId);
            
          localStorage.setItem(`txnId_${transactionId}`, foundId);
          return foundId;
        }
      }

      throw new Error("ID de transaction non trouvé");
    } catch (error) {
      console.error("Error in getStoredTxnId:", error);
      throw new Error("ID de transaction non trouvé");
    }
  };

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      try {
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
        setHasConfirmed(data.buyer_confirmation || data.seller_confirmation);
      } catch (err) {
        console.error("Error in fetchTransactionStatus:", err);
      }
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
          setHasConfirmed(payload.new.buyer_confirmation || payload.new.seller_confirmation);
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
