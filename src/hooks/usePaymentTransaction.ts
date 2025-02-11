
import { ethers } from 'ethers';
import { formatAmount, getEscrowContract, parseTransactionId } from '@/utils/escrow/contractUtils';
import { useTransactionCreation } from './useTransactionCreation';
import { useToast } from '@/components/ui/use-toast';

export const usePaymentTransaction = () => {
  const { createTransaction, updateTransactionWithBlockchain } = useTransactionCreation();
  const { toast } = useToast();

  const createPaymentTransaction = async (
    sellerAddress: string,
    cryptoAmount: number,
    listingId: string,
    cryptoCurrency: string = 'MATIC'
  ) => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      console.log('[usePaymentTransaction] Starting payment process:', {
        sellerAddress,
        cryptoAmount,
        listingId,
        cryptoCurrency
      });

      // 1. Créer d'abord la transaction dans Supabase
      const transaction = await createTransaction(
        listingId,
        cryptoAmount,
        cryptoCurrency,
        sellerAddress
      );

      // 2. Initialiser le provider et le contrat
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('Connected to network:', await provider.getNetwork());

      const contract = getEscrowContract(provider);
      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);

      console.log('Transaction params:', {
        sellerAddress,
        amountInWei: amountInWei.toString()
      });

      // 3. Vérifier le solde
      const signer = provider.getSigner();
      const balance = await provider.getBalance(await signer.getAddress());
      if (balance.lt(amountInWei)) {
        throw new Error("Solde insuffisant pour effectuer la transaction");
      }

      // 4. Estimer le gas
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

      // 5. Envoyer la transaction
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

      // 6. Parser l'ID de transaction blockchain
      const blockchainTxnId = await parseTransactionId(receipt);
      console.log('Parsed blockchain transaction ID:', blockchainTxnId);

      // 7. Mettre à jour la transaction Supabase
      await updateTransactionWithBlockchain(
        transaction.id,
        blockchainTxnId.toString(),
        tx.hash
      );

      toast({
        title: "Transaction réussie",
        description: "La transaction a été créée avec succès",
      });

      return transaction.id;
    } catch (error: any) {
      console.error('Error in createPaymentTransaction:', error);
      
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

  return { createPaymentTransaction };
};
