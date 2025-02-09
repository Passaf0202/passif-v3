
import { supabase } from "@/integrations/supabase/client";

export async function updateTransactionStatus(transactionId: string) {
  const { error } = await supabase
    .from('transactions')
    .update({
      buyer_confirmation: true,
      status: 'completed',
      escrow_status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId);

  if (error) throw error;
}

export async function getBlockchainTxnId(transactionId: string) {
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .select('blockchain_txn_id, status')
    .eq('id', transactionId)
    .single();

  if (txError || !transaction) {
    console.error('Error fetching transaction:', txError);
    throw new Error("Transaction non trouvée");
  }

  if (!transaction.blockchain_txn_id) {
    throw new Error("ID de transaction blockchain manquant");
  }

  const txnId = Number(transaction.blockchain_txn_id);
  if (isNaN(txnId)) {
    console.error('Invalid blockchain transaction ID:', transaction.blockchain_txn_id);
    throw new Error("ID de transaction blockchain invalide");
  }

  return txnId;
}
