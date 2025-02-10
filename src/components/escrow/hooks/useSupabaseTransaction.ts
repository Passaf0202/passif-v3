
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

    if (!txnData) {
      console.error("No transaction found with ID:", transactionId);
      throw new Error("Transaction non trouvée");
    }

    console.log("Transaction data retrieved:", txnData);
    return txnData;
  };

  const createSupabaseTransaction = async (transactionData: RequiredTransactionFields) => {
    console.log("Creating transaction with data:", transactionData);
    
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
      console.error("Error creating transaction:", createError);
      throw new Error("Erreur lors de la création de la transaction");
    }

    console.log("New transaction created:", newTransaction);
    return newTransaction;
  };

  return {
    fetchFromSupabase,
    createSupabaseTransaction
  };
};
