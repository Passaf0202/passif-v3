
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

      console.log('Starting transaction with seller:', sellerAddress);
      console.log('Amount:', cryptoAmount);

      // Forcer la connexion au réseau Polygon Amoy
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13881" }], // 80001 en hexadécimal
      }).catch(async (switchError: any) => {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x13881",
              chainName: "Polygon Amoy",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18
              },
              rpcUrls: ["https://rpc-amoy.polygon.technology"],
              blockExplorerUrls: ["https://www.oklink.com/amoy"]
            }]
          });
        } else {
          throw switchError;
        }
      });

      // Initialiser le provider et le signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Demander la connexion explicitement
      const signer = provider.getSigner();
      console.log('Signer initialized');

      // Obtenir l'adresse de l'utilisateur
      const userAddress = await signer.getAddress();
      console.log('User address:', userAddress);

      // Créer une instance du contrat
      const contract = getEscrowContract(signer);
      console.log('Contract initialized:', contract.address);

      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseEther(formattedAmount);
      console.log('Amount in Wei:', amountInWei.toString());

      // Vérifier le solde
      const balance = await provider.getBalance(userAddress);
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour effectuer la transaction");
      }

      // Estimer le gas
      const gasEstimate = await contract.estimateGas.createTransaction(sellerAddress, {
        value: amountInWei
      });
      console.log('Gas estimate:', gasEstimate.toString());

      // Envoyer la transaction
      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei,
        gasLimit: gasEstimate.mul(120).div(100) // +20% de marge
      });

      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (!receipt.status) {
        throw new Error("La transaction a échoué sur la blockchain");
      }

      const txIndex = receipt.logs[0].logIndex;
      console.log('Transaction index:', txIndex);

      if (transactionId) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            blockchain_txn_id: txIndex.toString(),
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

      return txIndex.toString();
    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      throw error;
    }
  };

  return { createTransaction };
};
