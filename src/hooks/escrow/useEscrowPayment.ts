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

      // Get the authenticated user first
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        console.error('Auth error:', authError);
        throw new Error("Vous devez être connecté pour effectuer un paiement");
      }

      // Récupérer les détails de l'annonce et du vendeur
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

      if (!listing.user?.wallet_address) {
        console.error('No wallet address found for seller');
        throw new Error("Le vendeur n'a pas connecté son portefeuille");
      }

      if (!listing.crypto_amount) {
        console.error('No crypto amount found for listing');
        throw new Error("Le montant en crypto n'est pas défini pour cette annonce");
      }

      // Vérifier le solde avant la transaction
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const balance = await provider.getBalance(address);
      const amountInWei = ethers.utils.parseEther(listing.crypto_amount.toString());
      
      if (balance.lt(amountInWei)) {
        throw new Error("Fonds insuffisants dans votre portefeuille");
      }

      // Estimer le gas nécessaire
      const gasPrice = await provider.getGasPrice();
      const gasLimit = ethers.BigNumber.from("200000"); // Augmenter la limite de gas
      const totalCost = amountInWei.add(gasPrice.mul(gasLimit));
      
      if (balance.lt(totalCost)) {
        throw new Error("Fonds insuffisants pour couvrir les frais de transaction");
      }

      console.log('Deploying contract with params:', {
        sellerAddress: listing.user.wallet_address,
        amount: ethers.utils.formatEther(amountInWei),
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
      });

      // Déployer le contrat d'escrow avec des paramètres de gas explicites
      const { contract, receipt } = await deployNewContract(
        listing.user.wallet_address,
        amountInWei,
        {
          gasLimit,
          gasPrice
        }
      );

      console.log('Contract deployed:', {
        address: contract.address,
        transactionHash: receipt.transactionHash
      });

      // Create transaction with correct user IDs
      const transaction = await createTransaction(
        listingId,
        authUser.id, // Use authenticated user ID for buyer
        listing.user.id, // Use seller's profile ID
        listing.crypto_amount,
        0,
        contract.address,
        97 // BSC Testnet chain ID
      );

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