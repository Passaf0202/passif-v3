
import { ethers } from 'ethers';
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, getEscrowContract, parseTransactionId } from '@/utils/escrow/contractUtils';

export const usePaymentTransaction = () => {
  const createTransaction = async (
    sellerAddress: string,
    cryptoAmount: number,
    transactionId?: string
  ) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = getEscrowContract(provider);
    
    const formattedAmount = formatAmount(cryptoAmount);
    const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);
    console.log('Amount in Wei:', amountInWei.toString());

    console.log('Creating transaction...');
    const tx = await contract.createTransaction(sellerAddress, {
      value: amountInWei,
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction receipt:', receipt);

    const txnId = await parseTransactionId(receipt);

    if (transactionId) {
      console.log('Storing transaction data:', {
        blockchain_txn_id: txnId,
        transaction_hash: tx.hash
      });

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          blockchain_txn_id: txnId,
          transaction_hash: tx.hash,
          funds_secured: true,
          funds_secured_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        throw updateError;
      }
    }

    return txnId;
  };

  return { createTransaction };
};
