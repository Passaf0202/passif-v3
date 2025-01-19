import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { parseEther } from "viem";
import { EscrowContractService } from "@/services/EscrowContractService";
import { TransactionService } from "@/services/TransactionService";
import { formatAddress } from "@/utils/addressUtils";
import { supabase } from "@/integrations/supabase/client";

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

      // Formater et valider l'adresse du vendeur
      const sellerAddress = formatAddress(listing.user.wallet_address);
      console.log('Formatted seller address:', sellerAddress);

      // Récupérer le contrat d'escrow actif
      const escrowContract = await EscrowContractService.getActiveContract();
      
      // Créer la transaction dans la base de données
      const transaction = await TransactionService.createTransaction({
        listingId,
        buyerId: address,
        sellerId: listing.user.id,
        amount: listing.crypto_amount || 0,
        commission: 0,
        contractAddress: escrowContract.address,
        chainId: escrowContract.chain_id
      });

      // Obtenir l'instance du contrat
      const escrow = await EscrowContractService.getContract(escrowContract.address);

      try {
        const amountInWei = parseEther(listing.crypto_amount?.toString() || "0");
        console.log('Amount in Wei:', amountInWei.toString());

        // Envoyer la transaction
        const tx = await escrow.deposit(sellerAddress, { value: amountInWei });
        console.log('Transaction sent:', tx.hash);
        setTransactionStatus('pending');
        
        if (onTransactionHash) {
          onTransactionHash(tx.hash);
        }

        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);

        if (receipt.status === 1) {
          await TransactionService.updateTransactionStatus(transaction.id, 'processing', tx.hash);
          setTransactionStatus('confirmed');
          toast({
            title: "Transaction confirmée",
            description: "Le paiement a été effectué avec succès",
          });
          onPaymentComplete();
        } else {
          setTransactionStatus('failed');
          throw new Error("La transaction a échoué");
        }
      } catch (txError: any) {
        console.error('Transaction error:', txError);
        throw txError;
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