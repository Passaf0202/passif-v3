
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
      
      // Vérifier que le provider est connecté
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      const contract = getEscrowContract(provider);
      
      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);
      console.log('Amount in Wei:', amountInWei.toString());

      console.log('Creating transaction with params:', {
        sellerAddress,
        cryptoAmount,
        transactionId,
        amountInWei: amountInWei.toString()
      });

      // Vérifier le solde avant la transaction
      const signer = provider.getSigner();
      const balance = await provider.getBalance(await signer.getAddress());
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour effectuer la transaction");
      }

      // Estimer le gas avant la transaction
      try {
        const gasEstimate = await contract.estimateGas.createTransaction(sellerAddress, {
          value: amountInWei,
        });
        console.log('Estimated gas:', gasEstimate.toString());
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        throw new Error("Impossible d'estimer les frais de gas. Vérifiez votre solde et les paramètres de la transaction.");
      }

      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei,
        gasLimit: ethers.utils.hexlify(300000), // Gas limit explicite
      });

      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (!receipt.status) {
        throw new Error("La transaction a échoué sur la blockchain");
      }

      const blockchainTxnId = await parseTransactionId(receipt);
      console.log('Parsed transaction ID:', blockchainTxnId);

      if (transactionId) {
        console.log('Storing transaction data:', {
          blockchain_txn_id: blockchainTxnId,
          transaction_hash: tx.hash
        });

        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            blockchain_txn_id: blockchainTxnId,
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

      return blockchainTxnId;
    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      
      // Amélioration des messages d'erreur
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error("Solde insuffisant pour effectuer la transaction");
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error("Impossible d'estimer les frais de gas. Vérifiez votre solde.");
      } else if (error.code === -32603) {
        throw new Error("Erreur RPC interne. Vérifiez que vous êtes bien connecté au bon réseau et que vous avez suffisamment de fonds.");
      } else if (error.message.includes('user rejected')) {
        throw new Error("Transaction rejetée par l'utilisateur");
      }
      
      throw new Error(error.message || "Une erreur est survenue lors de la transaction");
    }
  };

  return { createTransaction };
};
