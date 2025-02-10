
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "../types/escrow";

// Define a type with required fields for transaction creation
type RequiredTransactionFields = {
  amount: number;
  commission_amount: number;
  blockchain_txn_id: string;
} & Partial<Omit<Transaction, 'amount' | 'commission_amount' | 'blockchain_txn_id'>>;

export const useSupabaseTransaction = () => {
  const fetchFromSupabase = async (transactionId: string) => {
    console.log("Fetching transaction with ID:", transactionId);
    
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
      .eq("id", transactionId)
      .maybeSingle();

    if (txnError) {
      console.error("Error fetching transaction:", txnError);
      throw new Error("Impossible de charger les détails de la transaction");
    }

    console.log("Transaction data retrieved:", txnData);
    return txnData;
  };

  const createSupabaseTransaction = async (transactionData: RequiredTransactionFields) => {
    const { data: newTransaction, error: createError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (createError) {
      console.error("Error creating transaction:", createError);
      throw new Error("Erreur lors de la création de la transaction");
    }

    return newTransaction;
  };

  return {
    fetchFromSupabase,
    createSupabaseTransaction
  };
};
