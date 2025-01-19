import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseEther } from "viem";
import { useToast } from "@/components/ui/use-toast";

export const useTransactionManager = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');
  const { toast } = useToast();

  const createTransaction = async (
    listingId: string,
    buyerId: string,
    sellerId: string,
    amount: number,
    commission: number,
    contractAddress: string,
    chainId: number
  ) => {
    console.log('Creating transaction:', {
      listingId,
      buyerId,
      sellerId,
      amount,
      commission,
      contractAddress,
      chainId
    });

    const { data, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: sellerId,
        amount: amount,
        commission_amount: commission,
        status: 'pending',
        escrow_status: 'pending',
        smart_contract_address: contractAddress,
        chain_id: chainId,
        network: 'bsc_testnet',
        token_symbol: 'BNB'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      throw new Error("Erreur lors de la création de la transaction");
    }

    console.log('Transaction created:', data);
    return data;
  };

  const updateTransactionStatus = async (
    transactionId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    txHash?: string
  ) => {
    console.log('Updating transaction status:', {
      transactionId,
      status,
      txHash
    });

    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (txHash) {
      updates.transaction_hash = txHash;
    }

    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId);

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    console.log('Transaction status updated successfully');
  };

  return {
    isProcessing,
    setIsProcessing,
    error,
    setError,
    transactionStatus,
    setTransactionStatus,
    createTransaction,
    updateTransactionStatus
  };
};