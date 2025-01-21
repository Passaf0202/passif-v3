import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour créer une transaction");
      }

      // Verify that the authenticated user is the buyer
      if (user.id !== buyerId) {
        console.error('User ID mismatch:', { userId: user.id, buyerId });
        throw new Error("Vous n'êtes pas autorisé à créer cette transaction");
      }

      const { data, error: insertError } = await supabase
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
        .select('*')
        .single();

      if (insertError) {
        console.error('Transaction creation error:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        throw new Error("Erreur lors de la création de la transaction");
      }

      console.log('Transaction created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      throw error;
    }
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour mettre à jour une transaction");
      }

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
        .eq('id', transactionId)
        .filter('buyer_id', 'eq', user.id);

      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }

      console.log('Transaction status updated successfully');
    } catch (error) {
      console.error('Error in updateTransactionStatus:', error);
      throw error;
    }
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