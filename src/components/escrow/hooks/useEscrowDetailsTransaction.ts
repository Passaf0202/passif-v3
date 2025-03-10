
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "../types/escrow";

export const useEscrowDetailsTransaction = (transactionId: string) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchTransaction = async () => {
    setIsFetching(true);
    console.log("[useEscrowDetailsTransaction] Fetching transaction:", transactionId);

    try {
      const { data: txn, error } = await supabase
        .from('transactions')
        .select(`
          *,
          listing:listings!transactions_listing_id_fkey (
            title,
            wallet_address,
            user_id,
            images
          ),
          buyer:profiles!transactions_buyer_id_fkey (
            id,
            full_name,
            username,
            wallet_address
          ),
          seller:profiles!transactions_seller_id_fkey (
            id,
            full_name,
            username,
            wallet_address
          )
        `)
        .eq('id', transactionId)
        .maybeSingle();

      if (error) {
        console.error("[useEscrowDetailsTransaction] Error fetching transaction:", error);
        throw error;
      }

      if (!txn) {
        console.log("[useEscrowDetailsTransaction] No transaction found with ID:", transactionId);
        setTransaction(null);
        return;
      }

      // Log des adresses pour le debug
      console.log("[useEscrowDetailsTransaction] Addresses:", {
        seller_wallet_address: txn.seller_wallet_address,
        listing_wallet_address: txn.listing?.wallet_address,
        buyer_wallet: txn.buyer?.wallet_address,
        seller_wallet: txn.seller?.wallet_address
      });

      // Utiliser l'adresse du seller_wallet_address en priorité
      const sellerAddress = txn.seller_wallet_address;
      if (!sellerAddress) {
        console.error("[useEscrowDetailsTransaction] Missing seller address");
        throw new Error("Adresse du vendeur manquante");
      }

      console.log("[useEscrowDetailsTransaction] Transaction found:", txn);
      const formattedTransaction: Transaction = {
        id: txn.id,
        amount: txn.amount,
        commission_amount: txn.commission_amount,
        blockchain_txn_id: txn.blockchain_txn_id,
        status: txn.status,
        escrow_status: txn.escrow_status,
        token_symbol: txn.token_symbol || '',
        can_be_cancelled: txn.can_be_cancelled,
        funds_secured: txn.funds_secured,
        buyer_confirmation: txn.buyer_confirmation,
        seller_confirmation: txn.seller_confirmation,
        seller_wallet_address: sellerAddress,
        listing_title: txn.listing?.title || 'N/A',
        transaction_hash: txn.transaction_hash,
        block_number: txn.block_number,
        created_at: txn.created_at,
        updated_at: txn.updated_at,
        funds_secured_at: txn.funds_secured_at,
        cancelled_at: txn.cancelled_at,
        cancelled_by: txn.cancelled_by,
        buyer: txn.buyer ? {
          id: txn.buyer.id,
          wallet_address: txn.buyer.wallet_address,
          full_name: txn.buyer.full_name,
          username: txn.buyer.username
        } : undefined,
        seller: txn.seller ? {
          id: txn.seller.id,
          wallet_address: sellerAddress,
          full_name: txn.seller.full_name,
          username: txn.seller.username
        } : undefined,
        listing: txn.listing ? {
          title: txn.listing.title,
          wallet_address: txn.listing.wallet_address,
          user_id: txn.listing.user_id,
          images: txn.listing.images
        } : undefined
      };

      setTransaction(formattedTransaction);
    } catch (error) {
      console.error("[useEscrowDetailsTransaction] Unexpected error:", error);
      setTransaction(null);
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
