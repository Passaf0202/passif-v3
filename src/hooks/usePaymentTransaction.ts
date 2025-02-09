
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

      // Utiliser directement un JsonRpcProvider
      const provider = new ethers.providers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
      console.log('Provider initialized');

      // Vérifier la connexion au réseau
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      if (network.chainId !== 80001) {
        throw new Error("Erreur de connexion au réseau Polygon Amoy");
      }

      // Obtenir le signer depuis window.ethereum
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      
      // Créer un signer avec le provider RPC
      const signer = provider.getSigner(userAddress);
      console.log('Signer created for address:', userAddress);

      const contract = getEscrowContract(provider);
      console.log('Contract initialized:', contract.address);
      
      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);
      console.log('Amount in Wei:', amountInWei.toString());

      // Vérifier le solde
      const balance = await provider.getBalance(userAddress);
      console.log('User balance:', ethers.utils.formatEther(balance), 'MATIC');
      
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour effectuer la transaction");
      }

      // Estimer le gas
      const gasEstimate = await contract.estimateGas.createTransaction(sellerAddress, {
        value: amountInWei,
      });
      
      const gasPrice = await provider.getGasPrice();
      console.log('Gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
      
      const adjustedGasLimit = gasEstimate.mul(150).div(100); // +50% de marge
      console.log('Adjusted gas limit:', adjustedGasLimit.toString());

      // Vérifier que le solde peut couvrir le montant + les frais de gas
      const gasCost = adjustedGasLimit.mul(gasPrice);
      const totalCost = amountInWei.add(gasCost);
      
      if (balance.lt(totalCost)) {
        throw new Error("Solde insuffisant pour couvrir les frais de transaction");
      }

      // Connecter le contrat au signer
      const connectedContract = contract.connect(signer);
      console.log('Contract connected to signer');

      // Envoyer la transaction
      const tx = await connectedContract.createTransaction(sellerAddress, {
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
