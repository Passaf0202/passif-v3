
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

      // Force la connexion au réseau Polygon Amoy
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13881" }], // 80001 en hexadécimal
      }).catch(async (switchError: any) => {
        // Si le réseau n'existe pas, on l'ajoute
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

      // Initialiser le provider avec une configuration spécifique
      const provider = new ethers.providers.Web3Provider(window.ethereum, {
        name: 'Polygon Amoy',
        chainId: 80001,
        ensAddress: null // Désactive explicitement ENS
      });

      await provider.ready;
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      if (network.chainId !== 80001) {
        throw new Error("Veuillez vous connecter au réseau Polygon Amoy");
      }

      const signer = provider.getSigner();
      const contract = getEscrowContract(provider);
      
      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);
      console.log('Amount in Wei:', amountInWei.toString());

      // Vérifier le solde avant la transaction
      const balance = await provider.getBalance(await signer.getAddress());
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour effectuer la transaction");
      }

      // Estimer le gas
      const gasEstimate = await contract.estimateGas.createTransaction(sellerAddress, {
        value: amountInWei,
      });
      const gasPrice = await provider.getGasPrice();
      const adjustedGasLimit = gasEstimate.mul(150).div(100); // +50% de marge

      // Vérifier que le solde peut couvrir le montant + les frais de gas
      const gasCost = adjustedGasLimit.mul(gasPrice);
      const totalCost = amountInWei.add(gasCost);
      if (balance.lt(totalCost)) {
        throw new Error("Solde insuffisant pour couvrir les frais de transaction");
      }

      // Envoyer la transaction
      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei,
        gasLimit: adjustedGasLimit
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
