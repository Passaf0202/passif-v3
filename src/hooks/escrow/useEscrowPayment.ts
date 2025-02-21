
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEscrowContract } from "./useEscrowContract";
import { useTransactionUpdater } from "./useTransactionUpdater";
import { useAccount } from 'wagmi';

interface UseEscrowPaymentProps {
  listingId: string;
  onPaymentComplete: () => void;
}

export function useEscrowPayment({ 
  listingId,
  onPaymentComplete
}: UseEscrowPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');
  
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { getContract, getActiveContract } = useEscrowContract();
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

      // Get listing details
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
        console.error('Error fetching listing:', listingError);
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      // Get seller wallet address
      let sellerWalletAddress = listing.user?.wallet_address;
      if (!sellerWalletAddress) {
        const { data: sellerProfile, error: sellerError } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', listing.user_id)
          .single();

        if (sellerError) {
          console.error('Error fetching seller profile:', sellerError);
          throw new Error("Impossible de récupérer l'adresse du vendeur");
        }

        sellerWalletAddress = sellerProfile?.wallet_address;
      }

      if (!sellerWalletAddress) {
        throw new Error("L'adresse du vendeur n'est pas disponible");
      }

      console.log("Seller wallet address:", sellerWalletAddress);

      // Check crypto amount
      if (!listing.crypto_amount) {
        throw new Error("Le montant en crypto n'est pas défini");
      }

      // Prevent self-purchase
      if (sellerWalletAddress.toLowerCase() === address.toLowerCase()) {
        throw new Error("Vous ne pouvez pas acheter votre propre annonce");
      }

      // Get blockchain provider and check balance
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const balance = await provider.getBalance(address);
      const amountInWei = ethers.utils.parseEther(listing.crypto_amount.toString());

      if (balance.lt(amountInWei)) {
        throw new Error("Fonds insuffisants dans votre portefeuille");
      }

      // Get active contract
      const activeContract = await getActiveContract();
      if (!activeContract?.address) {
        throw new Error("Aucun contrat actif trouvé");
      }

      const contract = await getContract(activeContract.address);
      console.log("Contract instance initialized:", contract.address);

      // Estimate gas
      const gasPrice = await provider.getGasPrice();
      const estimatedGasLimit = await contract.estimateGas.createTransaction(
        sellerWalletAddress, 
        { value: amountInWei }
      );

      // Send transaction
      const tx = await contract.createTransaction(
        sellerWalletAddress, 
        {
          value: amountInWei,
          gasLimit: estimatedGasLimit,
          gasPrice
        }
      );

      console.log("Transaction sent:", tx.hash);
      setTransactionStatus('pending');

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Create transaction record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const transaction = await createTransaction(
        listingId,
        user.id,
        listing.user_id,
        listing.crypto_amount,
        listing.crypto_amount * 0.05, // 5% platform fee
        activeContract.address,
        activeContract.chain_id
      );

      // Update status
      if (receipt.status === 1) {
        await updateTransactionStatus(transaction.id, 'processing', tx.hash);
        setTransactionStatus('confirmed');
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
        description: error.message || "Une erreur est survenue",
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
