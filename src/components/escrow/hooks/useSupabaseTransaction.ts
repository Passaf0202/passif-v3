
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(transactionId)) {
      console.error("[useSupabaseTransaction] Invalid transaction ID format:", transactionId);
      throw new Error("Format d'ID de transaction invalide");
    }

    console.log("[useSupabaseTransaction] Fetching transaction with ID:", transactionId);
    
    // First, check if the transaction exists
    const { data: existCheck, error: existError } = await supabase
      .from("transactions")
      .select("id")
      .eq('id', transactionId)
      .maybeSingle();

    if (existError) {
      console.error("[useSupabaseTransaction] Error checking transaction existence:", existError);
      throw new Error("Erreur lors de la vérification de la transaction");
    }

    if (!existCheck) {
      console.error("[useSupabaseTransaction] Transaction not found in database");
      throw new Error("Transaction non trouvée");
    }

    // If transaction exists, fetch full details
    const { data: txnData, error: txnError } = await supabase
      .from("transactions")
      .select(`
        *,
        listings (
          *
        ),
        buyer:profiles!transactions_buyer_id_fkey (
          *
        ),
        seller:profiles!transactions_seller_id_fkey (
          *
        )
      `)
      .eq('id', transactionId)
      .single();

    if (txnError) {
      console.error("[useSupabaseTransaction] Error fetching transaction:", txnError);
      throw new Error("Impossible de charger les détails de la transaction");
    }

    if (!txnData) {
      console.error("[useSupabaseTransaction] No transaction found with ID:", transactionId);
      throw new Error("Transaction non trouvée");
    }

    console.log("[useSupabaseTransaction] Transaction data retrieved:", {
      id: txnData.id,
      status: txnData.status,
      buyer_id: txnData.buyer_id,
      seller_id: txnData.seller_id,
      listing_id: txnData.listing_id
    });
    
    return txnData;
  };

  const createSupabaseTransaction = async (transactionData: RequiredTransactionFields) => {
    console.log("[useSupabaseTransaction] Creating transaction with data:", transactionData);
    
    const { data: newTransaction, error: createError } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        status: 'pending',
        escrow_status: 'pending',
        blockchain_txn_id: transactionData.blockchain_txn_id || '0'
      })
      .select()
      .single();

    if (createError) {
      console.error("[useSupabaseTransaction] Error creating transaction:", createError);
      throw new Error("Erreur lors de la création de la transaction");
    }

    console.log("[useSupabaseTransaction] New transaction created:", newTransaction);
    return newTransaction;
  };

  return {
    fetchFromSupabase,
    createSupabaseTransaction
  };
};
