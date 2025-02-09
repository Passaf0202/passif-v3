
import { ethers } from 'ethers';
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, getEscrowContract } from '@/utils/escrow/contractUtils';

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

      if (network.chainId !== 80001) {
        throw new Error("Veuillez vous connecter au réseau Polygon Testnet");
      }

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
      const signerAddress = await signer.getAddress();
      const balance = await provider.getBalance(signerAddress);
      
      if (balance.lt(amountInWei)) {
        throw new Error("Solde POL insuffisant pour effectuer la transaction");
      }

      // Estimer le gas avant la transaction
      try {
        const gasEstimate = await contract.estimateGas.createTransaction(sellerAddress, {
          value: amountInWei,
        });
        console.log('Estimated gas:', gasEstimate.toString());

        // Ajouter 20% de marge au gas estimé
        const gasLimit = gasEstimate.mul(120).div(100);

        const tx = await contract.createTransaction(sellerAddress, {
          value: amountInWei,
          gasLimit
        });

        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);

        if (!receipt.status) {
          throw new Error("La transaction a échoué sur la blockchain");
        }

        // Mettre à jour la transaction dans la base de données si un ID est fourni
        if (transactionId) {
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              transaction_hash: tx.hash,
              funds_secured: true,
              funds_secured_at: new Date().toISOString()
            })
            .eq('id', transactionId);

          if (updateError) {
            console.error('Error updating transaction:', updateError);
          }
        }

        return tx.hash;

      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        if (gasError.code === 'UNPREDICTABLE_GAS_LIMIT') {
          throw new Error("Impossible d'estimer les frais de gas. Vérifiez votre solde POL.");
        }
        throw gasError;
      }

    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      
      // Améliorer les messages d'erreur
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error("Solde POL insuffisant pour payer les frais de transaction");
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error("Impossible d'estimer les frais de gas. Vérifiez votre solde POL.");
      } else if (error.code === -32603) {
        throw new Error("Erreur de transaction. Vérifiez votre solde POL et réessayez.");
      } else if (error.message.includes('user rejected')) {
        throw new Error("Transaction rejetée par l'utilisateur");
      }
      
      throw error;
    }
  };

  return { createTransaction };
};
