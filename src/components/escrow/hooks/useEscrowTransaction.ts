import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_ABI = [
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "event TransactionCreated(uint256 indexed txnId, address buyer, address seller, uint256 amount)"
];

const contractAddress = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export const useEscrowTransaction = (transactionId: string) => {
  const [status, setStatus] = useState<string>("pending");
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [fundsSecured, setFundsSecured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStoredTxnId = () => {
    const storedId = localStorage.getItem(`txnId_${transactionId}`);
    console.log("Retrieved stored txnId:", storedId);
    return storedId ? parseInt(storedId) : null;
  };

  const storeTxnId = (txnId: number) => {
    console.log("Storing txnId:", txnId);
    localStorage.setItem(`txnId_${transactionId}`, txnId.toString());
  };

  const getLastTransactionId = async (provider: ethers.providers.Web3Provider, transactionHash: string) => {
    try {
      const storedId = getStoredTxnId();
      if (storedId !== null) {
        console.log("Using stored txnId:", storedId);
        return storedId;
      }

      console.log("Getting transaction receipt for hash:", transactionHash);
      const receipt = await provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        console.error("No receipt found for transaction");
        return null;
      }

      console.log("Transaction receipt:", receipt);
      const contractInterface = new ethers.utils.Interface(ESCROW_ABI);
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = contractInterface.parseLog(log);
          if (parsedLog && parsedLog.name === 'TransactionCreated') {
            const txId = parsedLog.args.txnId.toNumber();
            console.log("Found TransactionCreated event with txId:", txId);
            storeTxnId(txId);
            return txId;
          }
        } catch (e) {
          console.log("Error parsing log:", e);
          continue;
        }
      }

      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, provider);
      const filter = contract.filters.TransactionCreated();
      const events = await contract.queryFilter(filter, receipt.blockNumber - 1, receipt.blockNumber);
      
      if (events.length > 0) {
        const txId = events[0].args.txnId.toNumber();
        console.log("Found TransactionCreated event via filter with txId:", txId);
        storeTxnId(txId);
        return txId;
      }

      return null;
    } catch (error) {
      console.error("Error getting last transaction ID:", error);
      return null;
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

      if (data.transaction_hash) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const txId = await getLastTransactionId(provider, data.transaction_hash);
          
          if (txId !== null) {
            console.log("Valid txId found:", txId);
            storeTxnId(txId);
          }
        } catch (error) {
          console.error("Error processing transaction receipt:", error);
        }
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