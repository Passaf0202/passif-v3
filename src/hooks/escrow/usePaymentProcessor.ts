import { parseEther } from "viem";
import { useToast } from "@/components/ui/use-toast";
import { useTransactionManager } from './useTransactionManager';
import { useEscrowContract } from './useEscrowContract';

export function usePaymentProcessor() {
  const { toast } = useToast();
  const { createTransaction, updateTransactionStatus } = useTransactionManager();
  const { getContract, getActiveContract } = useEscrowContract();

  const processPayment = async (
    listing: any,
    buyerAddress: string,
    onTransactionHash?: (hash: string) => void
  ) => {
    // Récupérer le contrat actif
    const activeContract = await getActiveContract();
    if (!activeContract) {
      throw new Error("Aucun contrat actif trouvé");
    }

    console.log('Using active contract:', activeContract.address);

    // Récupérer l'instance du contrat
    const contract = await getContract(activeContract.address);
    if (!contract) {
      throw new Error("Impossible d'initialiser le contrat");
    }

    const amountInWei = parseEther(listing.crypto_amount.toString());
    console.log('Payment amount in Wei:', amountInWei);

    // Créer la transaction dans la base de données
    const transaction = await createTransaction(
      listing.id,
      buyerAddress,
      listing.user.id,
      listing.crypto_amount,
      0,
      activeContract.address,
      97
    );

    console.log('Transaction created in database:', transaction);

    // Appeler la fonction deposit du contrat
    const tx = await contract.deposit(listing.user.wallet_address, {
      value: amountInWei,
      gasLimit: 200000
    });

    console.log('Transaction sent:', tx.hash);
    
    if (onTransactionHash) {
      onTransactionHash(tx.hash);
    }

    // Attendre la confirmation
    const receipt = await tx.wait();
    console.log('Transaction receipt:', receipt);

    if (receipt.status === 1) {
      await updateTransactionStatus(transaction.id, 'processing', tx.hash);
      toast({
        title: "Transaction confirmée",
        description: "Le paiement a été effectué avec succès",
      });
      return true;
    } else {
      throw new Error("La transaction a échoué");
    }
  };

  return { processPayment };
}