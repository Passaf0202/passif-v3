
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_ABI = [
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "function transactionCount() view returns (uint256)",
  "event TransactionCreated(uint256 indexed txnId, address buyer, address seller, uint256 amount)",
  "event FundsDeposited(uint256 txnId, address buyer, address seller, uint256 amount)"
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
      
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('blockchain_txn_id, transaction_hash, funds_secured')
        .eq('id', transactionId)
        .single();

      if (error) {
        console.error("Error fetching from Supabase:", error);
        throw error;
      }

      // Si l'ID de blockchain est déjà stocké, le retourner
      if (transaction?.blockchain_txn_id) {
        console.log("Found blockchain_txn_id in Supabase:", transaction.blockchain_txn_id);
        return transaction.blockchain_txn_id.toString();
      }

      // Si nous avons un hash de transaction, récupérer l'ID depuis les logs
      if (transaction?.transaction_hash) {
        console.log("Found transaction hash, fetching receipt:", transaction.transaction_hash);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const receipt = await provider.getTransactionReceipt(transaction.transaction_hash);
        
        if (receipt) {
          const contract = new ethers.Contract(contractAddress, ESCROW_ABI, provider);
          
          // Parcourir tous les logs pour trouver l'événement FundsDeposited
          for (const log of receipt.logs) {
            try {
              const parsedLog = contract.interface.parseLog(log);
              if (parsedLog.name === 'FundsDeposited') {
                const txnId = parsedLog.args.txnId.toString();
                console.log("Found txnId from FundsDeposited event:", txnId);

                // Mettre à jour la transaction dans Supabase
                await supabase
                  .from('transactions')
                  .update({
                    blockchain_txn_id: txnId,
                    funds_secured: true,
                    funds_secured_at: new Date().toISOString()
                  })
                  .eq('id', transactionId);

                return txnId;
              }
            } catch (e) {
              console.error("Error parsing log:", e);
              continue;
            }
          }
        }
      }

      throw new Error("ID de transaction non trouvé");
    } catch (error) {
      console.error("Error in getStoredTxnId:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("escrow_status, buyer_confirmation, seller_confirmation, funds_secured")
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
