
import { ethers } from 'ethers';
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, getEscrowContract, parseTransactionId } from '@/utils/escrow/contractUtils';

export const usePaymentTransaction = () => {
  const createTransaction = async (
    sellerAddress: string,
    cryptoAmount: number,
    transactionId?: string
  ) => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      console.log('Connected to network:', await provider.getNetwork());

      const contract = getEscrowContract(provider);
      
      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);
      console.log('Transaction params:', {
        sellerAddress,
        amountInWei: amountInWei.toString()
      });

      const signer = provider.getSigner();
      const balance = await provider.getBalance(await signer.getAddress());
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour effectuer la transaction");
      }

      const gasEstimate = await contract.estimateGas.createTransaction(sellerAddress, {
        value: amountInWei,
      });
      console.log('Estimated gas:', gasEstimate.toString());
      
      const gasPrice = await provider.getGasPrice();
      const adjustedGasLimit = gasEstimate.mul(150).div(100);

      const gasCost = adjustedGasLimit.mul(gasPrice);
      const totalCost = amountInWei.add(gasCost);
      if (balance.lt(totalCost)) {
        throw new Error("Solde insuffisant pour couvrir les frais de transaction");
      }

      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei,
        gasLimit: adjustedGasLimit,
        gasPrice: gasPrice.mul(120).div(100)
      });

      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (!receipt.status) {
        throw new Error("La transaction a échoué sur la blockchain");
      }

      const blockchainTxnId = await parseTransactionId(receipt);
      console.log('Parsed blockchain transaction ID:', blockchainTxnId);

      if (transactionId) {
        console.log('Updating Supabase transaction:', {
          blockchain_txn_id: blockchainTxnId,
          transaction_hash: tx.hash
        });

        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            blockchain_txn_id: blockchainTxnId.toString(),
            transaction_hash: tx.hash,
            funds_secured: true,
            funds_secured_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error('Error updating transaction:', updateError);
          throw new Error("Erreur lors de la mise à jour de la transaction dans la base de données");
        }
      }

      return blockchainTxnId.toString();
    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error("Solde insuffisant pour effectuer la transaction");
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error("Impossible d'estimer les frais de gas. Vérifiez votre solde.");
      } else if (error.code === -32603) {
        throw new Error("Erreur RPC interne. Vérifiez votre connexion au réseau.");
      } else if (error.message.includes('user rejected')) {
        throw new Error("Transaction rejetée par l'utilisateur");
      }
      
      throw new Error(error.message || "Une erreur est survenue lors de la transaction");
    }
  };

  return { createTransaction };
};

