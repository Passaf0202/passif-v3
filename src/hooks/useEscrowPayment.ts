import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from "viem";
import { bsc } from 'viem/chains';

interface UseEscrowPaymentProps {
  listingId: string;
  address?: string;
  onTransactionHash?: (hash: string) => void;
  onConfirmation?: (confirmations: number) => void;
  onPaymentComplete: () => void;
}

export function useEscrowPayment({ 
  listingId, 
  address,
  onTransactionHash,
  onConfirmation,
  onPaymentComplete 
}: UseEscrowPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escrowError, setEscrowError] = useState<null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  
  const { toast } = useToast();
  const publicClient = usePublicClient({ chainId: bsc.id });
  const { data: walletClient } = useWalletClient({ chainId: bsc.id });

  const handlePayment = async () => {
    if (!address || !walletClient) {
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

      // Get the user's profile ID first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', address)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Impossible de récupérer votre profil");
      }

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
        .single();

      if (listingError || !listing) {
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      if (!listing.user?.wallet_address) {
        throw new Error("Le vendeur n'a pas connecté son portefeuille");
      }

      if (!listing.crypto_amount || !listing.crypto_currency) {
        throw new Error("Les détails de paiement en crypto ne sont pas disponibles");
      }

      // Calculer la commission (2% du montant)
      const commission = listing.crypto_amount * 0.02;

      // Créer la transaction dans la base de données
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          listing_id: listingId,
          buyer_id: profile.id,
          seller_id: listing.user.id,
          amount: listing.crypto_amount,
          commission_amount: commission,
          token_symbol: listing.crypto_currency,
          status: 'pending',
          escrow_status: 'pending',
          chain_id: bsc.id
        })
        .select()
        .single();

      if (transactionError) {
        throw new Error("Erreur lors de la création de la transaction");
      }

      console.log('Sending transaction with details:', {
        to: listing.user.wallet_address,
        value: listing.crypto_amount,
        currency: listing.crypto_currency,
        chainId: bsc.id
      });

      // Envoyer la transaction sur BSC
      const hash = await walletClient.sendTransaction({
        account: address as `0x${string}`,
        to: listing.user.wallet_address as `0x${string}`,
        value: parseEther(listing.crypto_amount.toString()),
        chain: bsc,
        type: 'legacy'
      });

      console.log('Transaction sent:', hash);
      setCurrentHash(hash);
      setTransactionStatus('pending');
      onTransactionHash?.(hash);

      // Attendre la confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: hash as `0x${string}`,
      });

      if (receipt.status === 'success') {
        // Mettre à jour la transaction pour indiquer que les fonds sont sécurisés
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            funds_secured: true,
            funds_secured_at: new Date().toISOString(),
            transaction_hash: hash,
            status: 'processing'
          })
          .eq('id', transaction.id);

        if (updateError) {
          console.error('Error updating transaction:', updateError);
          throw new Error("Erreur lors de la mise à jour de la transaction");
        }

        setTransactionStatus('confirmed');
        onPaymentComplete();
        toast({
          title: "Succès",
          description: "Les fonds ont été bloqués avec succès. Ils seront libérés une fois que l'acheteur et le vendeur auront confirmé la transaction.",
        });
      } else {
        setTransactionStatus('failed');
        throw new Error("La transaction a échoué");
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "Une erreur est survenue lors du paiement");
      setTransactionStatus('failed');
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
    transactionStatus,
    handlePayment
  };
}