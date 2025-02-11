
import { ethers } from 'ethers';
import { formatAmount, getEscrowContract, parseTransactionId } from '@/utils/escrow/contractUtils';
import { useTransactionCreation } from './useTransactionCreation';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentTransaction = () => {
  const { updateTransactionWithBlockchain } = useTransactionCreation();
  const { toast } = useToast();

  const processPayment = async (
    transactionId: string,
    sellerAddress: string,
    cryptoAmount: number
  ) => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      console.log('[usePaymentTransaction] Starting payment process:', {
        transactionId,
        sellerAddress,
        cryptoAmount
      });

      // 1. Initialiser le provider et le contrat
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getEscrowContract(provider);
      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);

      console.log('[usePaymentTransaction] Creating blockchain transaction with params:', {
        sellerAddress,
        amountInWei: amountInWei.toString()
      });

      // 2. Créer la transaction blockchain
      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei
      });

      console.log('[usePaymentTransaction] Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('[usePaymentTransaction] Transaction confirmed:', receipt);

      // 3. Parser l'ID de transaction blockchain
      const blockchainTxnId = await parseTransactionId(receipt);
      console.log('[usePaymentTransaction] Parsed blockchain transaction ID:', blockchainTxnId);

      // 4. Mettre à jour la transaction Supabase
      await updateTransactionWithBlockchain(
        transactionId,
        blockchainTxnId,
        tx.hash
      );

      toast({
        title: "Transaction réussie",
        description: "Le paiement a été effectué avec succès",
      });

      return transactionId;
    } catch (error: any) {
      console.error('[usePaymentTransaction] Error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { processPayment };
};
