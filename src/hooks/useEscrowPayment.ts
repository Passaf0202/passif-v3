import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface EscrowError {
  available: string;
  required: string;
  missing: string;
}

interface UseEscrowPaymentProps {
  listingId: string;
  address?: string;
  onPaymentComplete: () => void;
}

export function useEscrowPayment({ listingId, address, onPaymentComplete }: UseEscrowPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escrowError, setEscrowError] = useState<EscrowError | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePayment = async (includeEscrowFees: boolean = false) => {
    if (!address) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre portefeuille pour continuer",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setEscrowError(null);
      console.log('Starting payment process for listing:', listingId);

      // Récupérer les détails de l'annonce et du vendeur
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            wallet_address
          )
        `)
        .eq('id', listingId)
        .single();

      if (listingError || !listing) {
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      if (!listing.user?.wallet_address) {
        throw new Error("Le vendeur n'a pas connecté son portefeuille");
      }

      console.log('Initiating transaction with params:', {
        listingId,
        buyerAddress: address,
        sellerAddress: listing.user.wallet_address,
        amount: listing.crypto_amount,
        includeEscrowFees
      });

      const { data, error } = await supabase.functions.invoke('handle-crypto-payment', {
        body: {
          listingId,
          buyerAddress: address,
          sellerAddress: listing.user.wallet_address,
          amount: listing.crypto_amount?.toString(),
          includeEscrowFees
        }
      });

      if (error) {
        try {
          const errorBody = JSON.parse(error.message);
          if (errorBody.error === 'insufficient_escrow_funds') {
            setEscrowError({
              available: errorBody.details.have,
              required: errorBody.details.want,
              missing: errorBody.details.missing
            });
            return;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw error;
      }

      console.log('Transaction completed:', data);

      // Mettre à jour le statut de l'annonce
      await supabase
        .from('listings')
        .update({ 
          status: 'sold', 
          payment_status: 'completed'
        })
        .eq('id', listingId);

      toast({
        title: "Paiement réussi !",
        description: "Votre transaction a été effectuée avec succès",
      });

      onPaymentComplete();

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "Une erreur est survenue lors du paiement");
      toast({
        title: "Erreur de paiement",
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
    escrowError,
    handlePayment
  };
}