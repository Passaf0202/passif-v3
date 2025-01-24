import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEscrowContract } from "./useEscrowContract";
import { useTransactionUpdater } from "./useTransactionUpdater";
import { parseEther } from "viem";

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
      console.log('Starting escrow payment process for listing:', listingId);

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error("Vous devez être connecté pour effectuer un paiement");
      }

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            id,
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

      if (!listing.crypto_amount) {
        throw new Error("Le montant en crypto n'est pas défini pour cette annonce");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      
      // Convertir le montant en wei
      const amountInWei = parseEther(listing.crypto_amount.toString());
      
      if (balance.lt(amountInWei)) {
        throw new Error("Fonds insuffisants dans votre portefeuille");
      }

      console.log('Deploying escrow contract with params:', {
        sellerAddress: listing.user.wallet_address,
        amount: amountInWei.toString(),
      });

      const { contract, receipt } = await deployNewContract(
        listing.user.wallet_address,
        amountInWei
      );

      console.log('Escrow contract deployed:', {
        address: contract.address,
        transactionHash: receipt.transactionHash
      });

      const transaction = await createTransaction(
        listingId,
        authUser.id,
        listing.user.id,
        listing.crypto_amount,
        listing.crypto_amount * 0.05,
        contract.address,
        80002 // Polygon Amoy chain ID
      );

      if (receipt.status === 1) {
        await updateTransactionStatus(transaction.id, 'processing', receipt.transactionHash);
        
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            funds_secured: true,
            funds_secured_at: new Date().toISOString()
          })
          .eq('id', transaction.id);

        if (updateError) {
          console.error('Error updating transaction funds_secured status:', updateError);
        }

        setTransactionStatus('confirmed');
        toast({
          title: "Transaction initiée",
          description: "Les fonds ont été bloqués dans le contrat d'escrow. Ils seront libérés après confirmation des deux parties.",
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