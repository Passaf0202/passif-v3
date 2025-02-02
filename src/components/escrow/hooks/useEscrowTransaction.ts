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
      console.log('Getting stored txnId for transaction:', transactionId);
      
      // 1. D'abord, essayer de récupérer depuis Supabase
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('blockchain_txn_id')
        .eq('id', transactionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching from Supabase:', error);
      } else if (transaction?.blockchain_txn_id) {
        console.log("Retrieved blockchain_txn_id from Supabase:", transaction.blockchain_txn_id);
        return transaction.blockchain_txn_id.toString();
      }

      // 2. Essayer localStorage
      const storedId = localStorage.getItem(`txnId_${transactionId}`);
      if (storedId) {
        console.log("Retrieved stored txnId from localStorage:", storedId);
        return storedId;
      }

      // 3. Si toujours pas trouvé, essayer de le récupérer depuis la blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, provider);
      
      const txnCount = await contract.transactionCount();
      console.log("Current transaction count:", txnCount.toString());
      
      // Parcourir les dernières transactions pour trouver la bonne
      for (let i = txnCount.sub(1); i.gte(0); i = i.sub(1)) {
        try {
          const txData = await contract.getTransaction(i);
          console.log(`Checking transaction ${i}:`, txData);
          
          if (txData.amount.gt(0)) {
            // Stocker l'ID trouvé
            const txnId = i.toString();
            localStorage.setItem(`txnId_${transactionId}`, txnId);
            
            // Mettre à jour Supabase
            await supabase
              .from('transactions')
              .update({ blockchain_txn_id: txnId })
              .eq('id', transactionId);
              
            console.log("Found and stored valid txnId:", txnId);
            return txnId;
          }
        } catch (err) {
          console.log(`Error checking transaction ${i}:`, err);
          continue;
        }
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