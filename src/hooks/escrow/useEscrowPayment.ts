import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEscrowContract } from "./useEscrowContract";
import { useTransactionUpdater } from "./useTransactionUpdater";
import { validateAndUpdateCryptoAmount } from "./useCryptoAmount";
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
  const { deployNewContract } = useEscrowContract();
  const { createTransaction, updateTransactionStatus } = useTransactionUpdater();

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

      // Valider et mettre à jour le montant en crypto si nécessaire
      const validatedListing = await validateAndUpdateCryptoAmount(listing);
      console.log('Validated listing:', validatedListing);

      // Vérifier le solde avant la transaction
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      const amountInWei = ethers.utils.parseEther(validatedListing.crypto_amount.toString());
      
      if (balance.lt(amountInWei)) {
        throw new Error("Fonds insuffisants dans votre portefeuille");
      }

      // Déployer le contrat d'escrow
      const { contract, receipt } = await deployNewContract(
        validatedListing.user.wallet_address,
        amountInWei
      );

      // Créer la transaction dans la base de données
      const transaction = await createTransaction(
        listingId,
        address,
        validatedListing.user.id,
        validatedListing.crypto_amount,
        0,
        contract.address,
        97 // BSC Testnet chain ID
      );

      console.log('Contract deployed and transaction created:', {
        contractAddress: contract.address,
        transactionId: transaction.id
      });

      if (receipt.status === 1) {
        await updateTransactionStatus(transaction.id, 'processing', receipt.transactionHash);
        setTransactionStatus('confirmed');
        toast({
          title: "Transaction confirmée",
          description: "Le paiement a été effectué avec succès",
        });
        onPaymentComplete();
      } else {
        throw new Error("La transaction a échoué sur la blockchain");
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