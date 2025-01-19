import { supabase } from "@/integrations/supabase/client";

interface CreateTransactionParams {
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  commission: number;
  contractAddress: string;
  chainId: number;
}

export class TransactionService {
  static async createTransaction({
    listingId,
    buyerId,
    sellerId,
    amount,
    commission,
    contractAddress,
    chainId
  }: CreateTransactionParams) {
    console.log('Creating transaction:', {
      listingId,
      buyerId,
      sellerId,
      amount,
      commission,
      contractAddress,
      chainId
    });

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: sellerId,
        amount: amount,
        commission_amount: commission,
        status: 'pending',
        network: 'bsc_testnet',
        token_symbol: 'BNB',
        smart_contract_address: contractAddress,
        escrow_status: 'pending',
        chain_id: chainId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    console.log('Transaction created:', data);
    return data;
  }

  static async updateTransactionStatus(
    transactionId: string,
    status: string,
    txHash?: string
  ) {
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
  }
}