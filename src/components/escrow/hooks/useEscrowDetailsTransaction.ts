
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
      // D'abord essayer de récupérer par ID de transaction
      let { data: txn, error } = await supabase
        .from('transactions')
        .select(`
          *,
          listing:listings!transactions_listing_id_fkey (
            title
          ),
          buyer:profiles!transactions_buyer_id_fkey (
            id,
            full_name
          ),
          seller:profiles!transactions_seller_id_fkey (
            id,
            full_name
          )
        `)
        .eq('id', transactionId)
        .maybeSingle();

      if (error) {
        console.error("[useEscrowDetailsTransaction] Error fetching transaction by ID:", error);
        throw error;
      }

      // Si pas trouvé par ID, chercher par listing_id en prenant la plus récente transaction valide
      if (!txn) {
        console.log("[useEscrowDetailsTransaction] No transaction found with ID, trying listing_id with filters");
        const { data: txnByListing, error: listingError } = await supabase
          .from('transactions')
          .select(`
            *,
            listing:listings!transactions_listing_id_fkey (
              title
            ),
            buyer:profiles!transactions_buyer_id_fkey (
              id,
              full_name
            ),
            seller:profiles!transactions_seller_id_fkey (
              id,
              full_name
            )
          `)
          .eq('listing_id', transactionId)
          .not('blockchain_txn_id', 'eq', '0')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (listingError) {
          console.error("[useEscrowDetailsTransaction] Error fetching by listing_id:", listingError);
          throw listingError;
        }

        txn = txnByListing;
      }

      // Si on a trouvé une transaction, la formater
      if (txn) {
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
          funds_secured_at: txn.funds_secured_at,
          buyer_confirmation: txn.buyer_confirmation,
          seller_confirmation: txn.seller_confirmation,
          seller_wallet_address: txn.seller_wallet_address,
          listing_title: txn.listing?.title || 'N/A',
          transaction_hash: txn.transaction_hash,
          block_number: txn.block_number,
          buyer: txn.buyer,
          seller: txn.seller,
          listing: txn.listing
        };
        setTransaction(formattedTransaction);
      } else {
        // Si aucune transaction n'est trouvée, logger pour le debug
        console.log("[useEscrowDetailsTransaction] No valid transaction found for:", transactionId);
        setTransaction(null);
      }
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
