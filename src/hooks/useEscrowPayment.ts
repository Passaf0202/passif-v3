import { useEscrowContract } from './escrow/useEscrowContract';
import { useTransactionManager } from './escrow/useTransactionManager';
import { supabase } from "@/integrations/supabase/client";
import { parseEther } from "viem";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface UseEscrowPaymentProps {
  listingId: string;
  address?: string;
  onTransactionHash?: (hash: string) => void;
  onPaymentComplete: () => void;
}

export function useEscrowPayment({ 
  listingId, 
  address,
  onTransactionHash,
  onPaymentComplete 
}: UseEscrowPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');
  
  const { toast } = useToast();
  const { getContract, getActiveContract } = useEscrowContract();
  const { createTransaction, updateTransactionStatus } = useTransactionManager();

  const handlePayment = async () => {
    if (!address) {
      setError("Veuillez connecter votre portefeuille pour continuer");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      console.log('Starting payment process for listing:', listingId);

      // Récupérer les détails de l'annonce et du vendeur
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            wallet_address,
            id
          )
        `)
        .eq('id', listingId)
        .maybeSingle();

      if (listingError || !listing) {
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      if (!listing.user?.wallet_address) {
        throw new Error("Le vendeur n'a pas connecté son portefeuille");
      }

      if (!listing.crypto_amount) {
        throw new Error("Le montant en crypto n'est pas défini pour cette annonce");
      }

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
        listingId,
        address,
        listing.user.id,
        listing.crypto_amount,
        0,
        activeContract.address,
        97 // BSC Testnet chain ID
      );

      console.log('Transaction created in database:', transaction);

      // Appeler la fonction deposit du contrat
      const tx = await contract.deposit(listing.user.wallet_address, {
        value: amountInWei,
        gasLimit: 200000
      });

      console.log('Transaction sent:', tx.hash);
      setTransactionStatus('pending');
      
      if (onTransactionHash) {
        onTransactionHash(tx.hash);
      }

      // Attendre la confirmation
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        await updateTransactionStatus(transaction.id, 'processing', tx.hash);
        setTransactionStatus('confirmed');
        toast({
          title: "Transaction confirmée",
          description: "Le paiement a été effectué avec succès",
        });
        onPaymentComplete();
      } else {
        throw new Error("La transaction a échoué");
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "Une erreur est survenue lors du paiement");
      setTransactionStatus('failed');
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    transactionStatus,
    handlePayment
  };
}