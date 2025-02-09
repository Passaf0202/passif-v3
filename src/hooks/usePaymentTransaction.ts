
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
      await provider.send("eth_requestAccounts", []); // Demander explicitement la connexion
      
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      if (network.chainId !== 80002) {
        throw new Error("Veuillez vous connecter au réseau Polygon Amoy");
      }

      const signer = provider.getSigner();
      console.log('Got signer, fetching contract...');
      const contract = getEscrowContract(provider);
      console.log('Contract instance created');
      
      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);
      console.log('Amount in Wei:', amountInWei.toString());

      // Vérifier le solde avant la transaction
      const signerAddress = await signer.getAddress();
      const balance = await provider.getBalance(signerAddress);
      console.log('Current balance:', ethers.utils.formatEther(balance), 'POL');
      
      if (balance.lt(amountInWei)) {
        console.error('Insufficient balance:', {
          balance: ethers.utils.formatEther(balance),
          required: formattedAmount
        });
        throw new Error("Solde POL insuffisant pour effectuer la transaction");
      }

      // Ajouter un délai avant la transaction pour s'assurer que la connexion est stable
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Créer la transaction avec un gas limit fixe et un prix du gas légèrement plus élevé
      try {
        const gasPrice = await provider.getGasPrice();
        const adjustedGasPrice = gasPrice.mul(120).div(100); // +20% pour assurer la transaction
        console.log('Using gas price:', ethers.utils.formatUnits(adjustedGasPrice, 'gwei'), 'gwei');

        const tx = await contract.createTransaction(sellerAddress, {
          value: amountInWei,
          gasLimit: 300000,
          gasPrice: adjustedGasPrice
        });

        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);

        if (!receipt.status) {
          throw new Error("La transaction a échoué sur la blockchain");
        }

        // Mettre à jour la transaction dans la base de données
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

      } catch (txError: any) {
        console.error('Transaction failed:', txError);
        
        // Améliorer la détection des erreurs spécifiques
        if (txError.code === 'INSUFFICIENT_FUNDS') {
          throw new Error("Solde POL insuffisant pour payer les frais de transaction");
        } else if (txError.code === 'UNPREDICTABLE_GAS_LIMIT') {
          throw new Error("Erreur lors de l'estimation des frais. Veuillez réessayer.");
        } else if (txError.code === 'NETWORK_ERROR') {
          throw new Error("Erreur de connexion au réseau. Veuillez vérifier votre connexion et réessayer.");
        } else if (txError.message?.includes('execution reverted')) {
          throw new Error("Le contrat a rejeté la transaction. Veuillez vérifier les paramètres.");
        }
        
        throw new Error("Une erreur est survenue lors de la transaction. Veuillez réessayer.");
      }

    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      
      if (error.code === -32603) {
        throw new Error("Erreur de connexion au réseau. Veuillez rafraîchir la page et réessayer.");
      } else if (error.message.includes('user rejected')) {
        throw new Error("Transaction rejetée par l'utilisateur");
      }
      
      throw error;
    }
  };

  return { createTransaction };
};
