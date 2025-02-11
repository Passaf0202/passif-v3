
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

      // 1. Demander explicitement l'accès aux comptes MetaMask
      console.log('[usePaymentTransaction] Requesting account access...');
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // 2. Initialiser le provider et le contrat
      console.log('[usePaymentTransaction] Initializing provider and signer...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Vérifier que nous avons bien un signer
      const signerAddress = await signer.getAddress();
      console.log('[usePaymentTransaction] Signer address:', signerAddress);

      const contract = getEscrowContract(provider);
      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);

      console.log('[usePaymentTransaction] Creating blockchain transaction with params:', {
        sellerAddress,
        amountInWei: amountInWei.toString()
      });

      // 3. Créer la transaction blockchain
      const tx = await contract.connect(signer).createTransaction(sellerAddress, {
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
      // Gérer spécifiquement les erreurs MetaMask
      if (error.code === 4001) {
        toast({
          title: "Transaction annulée",
          description: "Vous avez refusé la transaction dans MetaMask",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors du paiement",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  return { processPayment };
};
