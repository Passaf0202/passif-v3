import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNetworkManager } from './escrow/useNetworkManager';
import { fetchListingDetails } from './escrow/useListingDetails';
import { usePaymentProcessor } from './escrow/usePaymentProcessor';

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
  const { ensureCorrectNetwork } = useNetworkManager();
  const { processPayment } = usePaymentProcessor();

  const handlePayment = async () => {
    if (!address) {
      setError("Veuillez connecter votre portefeuille pour continuer");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      console.log('Starting payment process for listing:', listingId);

      // S'assurer qu'on est sur le bon réseau
      await ensureCorrectNetwork();

      // Récupérer les détails de l'annonce
      const listing = await fetchListingDetails(listingId);

      // Vérifier que la crypto est bien BNB
      if (listing.crypto_currency !== 'BNB') {
        throw new Error(`Cette annonce requiert un paiement en ${listing.crypto_currency}`);
      }

      setTransactionStatus('pending');

      // Traiter le paiement
      const success = await processPayment(listing, address, onTransactionHash);
      
      if (success) {
        setTransactionStatus('confirmed');
        onPaymentComplete();
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