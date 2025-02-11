
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "../types/escrow";

type RequiredTransactionFields = {
  amount: number;
  commission_amount: number;
  blockchain_txn_id: string;
} & Partial<Omit<Transaction, 'amount' | 'commission_amount' | 'blockchain_txn_id'>>;

export const useSupabaseTransaction = () => {
  const fetchFromSupabase = async (transactionId: string) => {
    if (!transactionId) {
      console.error("[useSupabaseTransaction] No transaction ID provided");
      throw new Error("ID de transaction manquant");
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(transactionId)) {
      console.error("[useSupabaseTransaction] Invalid transaction ID format:", transactionId);
      throw new Error("Format d'ID de transaction invalide");
    }

    console.log("[useSupabaseTransaction] Fetching transaction with ID:", transactionId);
    
    try {
      // Première vérification dans la table transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select(`
          *,
          listings!transactions_listing_id_fkey (
            title,
            user_id,
            wallet_address
          ),
          buyer:profiles!transactions_buyer_id_fkey (
            id,
            wallet_address
          ),
          seller:profiles!transactions_seller_id_fkey (
            id,
            wallet_address
          )
        `)
        .eq('id', transactionId)
        .maybeSingle();

      if (transactionError) {
        console.error("[useSupabaseTransaction] Error fetching transaction:", transactionError);
        throw new Error("Erreur lors de la récupération de la transaction");
      }

      // Si pas trouvé dans transactions, chercher dans transaction_details
      if (!transactionData) {
        console.log("[useSupabaseTransaction] Transaction not found in transactions table, checking transaction_details");
        const { data: detailsData, error: detailsError } = await supabase
          .from("transaction_details")
          .select(`
            *,
            listings!transactions_listing_id_fkey (
              title
            )
          `)
          .eq('id', transactionId)
          .maybeSingle();

        if (detailsError) {
          console.error("[useSupabaseTransaction] Error fetching from transaction_details:", detailsError);
          throw new Error("Erreur lors de la récupération des détails de la transaction");
        }

        if (!detailsData) {
          console.error("[useSupabaseTransaction] Transaction not found in any table");
          throw new Error("Transaction non trouvée");
        }

        console.log("[useSupabaseTransaction] Found in transaction_details:", detailsData);
        return {
          ...detailsData,
          listing_title: detailsData.listings?.title || detailsData.listing_title || 'N/A'
        };
      }

      console.log("[useSupabaseTransaction] Transaction found:", transactionData);
      return {
        ...transactionData,
        listing_title: transactionData.listings?.title || 'N/A'
      };
    } catch (error) {
      console.error("[useSupabaseTransaction] Unexpected error:", error);
      throw error;
    }
  };

  const createSupabaseTransaction = async (transactionData: RequiredTransactionFields) => {
    console.log("[useSupabaseTransaction] Creating transaction with data:", transactionData);
    
    try {
      const { data: newTransaction, error: createError } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          status: 'pending',
          escrow_status: 'pending',
          blockchain_txn_id: transactionData.blockchain_txn_id || '0',
          can_be_cancelled: true,
          funds_secured: false
        })
        .select()
        .single();

      if (createError) {
        console.error("[useSupabaseTransaction] Error creating transaction:", createError);
        throw new Error("Erreur lors de la création de la transaction");
      }

      console.log("[useSupabaseTransaction] New transaction created:", newTransaction);
      return newTransaction;
    } catch (error) {
      console.error("[useSupabaseTransaction] Unexpected error creating transaction:", error);
      throw error;
    }
  };

  return {
    fetchFromSupabase,
    createSupabaseTransaction
  };
};
