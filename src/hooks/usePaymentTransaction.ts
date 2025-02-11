
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

      console.log('[usePaymentTransaction] Supabase transaction created:', transaction);

      // 2. Initialiser le provider et le contrat
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getEscrowContract(provider);
      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);

      console.log('[usePaymentTransaction] Creating blockchain transaction with params:', {
        sellerAddress,
        amountInWei: amountInWei.toString()
      });

      // 3. Créer la transaction blockchain
      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei
      });

      console.log('[usePaymentTransaction] Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('[usePaymentTransaction] Transaction confirmed:', receipt);

      // 4. Parser l'ID de transaction blockchain
      const blockchainTxnId = await parseTransactionId(receipt);
      console.log('[usePaymentTransaction] Parsed blockchain transaction ID:', blockchainTxnId);

      // 5. Mettre à jour la transaction Supabase
      await updateTransactionWithBlockchain(
        transaction.id,
        blockchainTxnId,
        tx.hash
      );

      toast({
        title: "Transaction réussie",
        description: "Le paiement a été effectué avec succès",
      });

      return transaction.id; // Retourner l'ID de la transaction Supabase
    } catch (error: any) {
      console.error('[usePaymentTransaction] Error:', error);
      throw error;
    }
  };

  return { createPaymentTransaction };
};
