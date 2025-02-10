
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "../types/escrow";

export const useSupabaseTransaction = () => {
  const fetchFromSupabase = async (transactionId: string) => {
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

    return txnData;
  };

  const createSupabaseTransaction = async (transactionData: Partial<Transaction>) => {
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
