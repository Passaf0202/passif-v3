
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
    cryptoCurrency: string = 'POL'
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

      // Ensure minimum amount for POL
      const minimumAmount = 0.001;
      if (cryptoCurrency === 'POL' && cryptoAmount < minimumAmount) {
        cryptoAmount = minimumAmount;
      }

      // 1. Vérifier le solde avant de créer la transaction
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const amountInWei = ethers.utils.parseUnits(formatAmount(cryptoAmount), 18);

      // Estimation des frais de gas
      const contract = getEscrowContract(provider);
      const gasLimit = await contract.estimateGas.createTransaction(sellerAddress, {
        value: amountInWei
      });
      const gasPrice = await provider.getGasPrice();
      const gasCost = gasLimit.mul(gasPrice);
      const totalRequired = amountInWei.add(gasCost);

      if (balance.lt(totalRequired)) {
        const requiredPOL = ethers.utils.formatEther(totalRequired);
        const currentPOL = ethers.utils.formatEther(balance);
        throw new Error(`Fonds insuffisants. Vous avez ${Number(currentPOL).toFixed(6)} POL mais la transaction nécessite environ ${Number(requiredPOL).toFixed(6)} POL (montant + frais de gas). Veuillez obtenir plus de POL sur Polygon Amoy.`);
      }

      // 2. Créer d'abord la transaction dans Supabase
      const transaction = await createTransaction(
        listingId,
        cryptoAmount,
        cryptoCurrency,
        sellerAddress
      );

      console.log('[usePaymentTransaction] Supabase transaction created:', transaction);

      // 3. Créer la transaction blockchain
      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei,
        gasLimit,
        gasPrice
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

      return transaction.id;
    } catch (error: any) {
      console.error('[usePaymentTransaction] Error:', error);
      
      // Améliorer le message d'erreur pour les erreurs spécifiques
      let errorMessage = error.message;
      
      if (error.code === 4001) {
        errorMessage = "Transaction refusée par l'utilisateur";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Fonds insuffisants sur votre wallet Polygon Amoy (POL)";
      }

      throw new Error(errorMessage);
    }
  };

  return { createPaymentTransaction };
};
