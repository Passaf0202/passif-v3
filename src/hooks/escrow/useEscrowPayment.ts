
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEscrowContract } from "./useEscrowContract";
import { useTransactionUpdater } from "./useTransactionUpdater";

interface UseEscrowPaymentProps {
  listingId: string;
  address?: string;
  onTransactionHash?: (hash: string) => void;
  onPaymentComplete: () => void;
  onTransactionCreated?: (id: string) => void;
}

export function useEscrowPayment({ 
  listingId, 
  address,
  onTransactionHash,
  onPaymentComplete,
  onTransactionCreated
}: UseEscrowPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');
  
  const { toast } = useToast();
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

      // Get the authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        console.error('Auth error:', authError);
        throw new Error("Vous devez être connecté pour effectuer un paiement");
      }

      // Récupérer les détails de l'annonce avec le wallet_address du vendeur
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

      // Si le wallet_address n'est pas dans la table listings, le récupérer depuis le profil du vendeur
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

      if (!listing.crypto_amount) {
        throw new Error("Le montant en crypto n'est pas défini");
      }

      if (sellerWalletAddress.toLowerCase() === address.toLowerCase()) {
        throw new Error("Vous ne pouvez pas acheter votre propre annonce");
      }

      // Vérifier le solde
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const balance = await provider.getBalance(address);
      const amountInWei = ethers.utils.parseEther(listing.crypto_amount.toString());

      if (balance.lt(amountInWei)) {
        throw new Error("Fonds insuffisants dans votre portefeuille");
      }

      // Récupérer le smart contract
      const activeContract = await getActiveContract();
      if (!activeContract?.address) {
        throw new Error("Aucun contrat actif trouvé");
      }

      const contract = await getContract(activeContract.address);
      console.log("Contract instance initialized:", contract);

      // Estimation des frais de gas
      const gasPrice = await provider.getGasPrice();
      const estimatedGasLimit = await contract.estimateGas.createTransaction(sellerWalletAddress, {
        value: amountInWei
      });

      const totalCost = amountInWei.add(gasPrice.mul(estimatedGasLimit));
      if (balance.lt(totalCost)) {
        throw new Error("Fonds insuffisants pour couvrir les frais de transaction");
      }

      console.log("Transaction parameters:", {
        seller: sellerWalletAddress,
        amount: ethers.utils.formatEther(amountInWei),
        gasLimit: estimatedGasLimit.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
      });

      // Exécuter la transaction
      const tx = await contract.createTransaction(sellerWalletAddress, {
        value: amountInWei,
        gasLimit: estimatedGasLimit,
        gasPrice
      });

      console.log("Transaction sent:", tx.hash);
      if (onTransactionHash) {
        onTransactionHash(tx.hash);
      }

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Créer l'entrée transaction en base de données
      const transaction = await createTransaction(
        listingId,
        authUser.id,
        listing.user_id,
        listing.crypto_amount,
        listing.crypto_amount * 0.05,
        activeContract.address,
        activeContract.chain_id
      );

      if (onTransactionCreated && transaction.id) {
        onTransactionCreated(transaction.id);
      }

      if (receipt.status === 1) {
        await updateTransactionStatus(transaction.id, 'processing', tx.hash);

        await supabase.from('transactions')
          .update({
            funds_secured: true,
            funds_secured_at: new Date().toISOString()
          })
          .eq('id', transaction.id);

        setTransactionStatus('confirmed');
        toast({
          title: "Transaction réussie",
          description: "Les fonds sont bloqués dans l'escrow.",
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
