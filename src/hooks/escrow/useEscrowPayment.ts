
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEscrowContract } from "./useEscrowContract";
import { useTransactionUpdater } from "./useTransactionUpdater";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";

interface UseEscrowPaymentProps {
  listingId: string;
  address?: string;
  onTransactionHash?: (hash: string) => void;
  onTransactionCreated?: (id: string) => void;
  onPaymentComplete: () => void;
}

export function useEscrowPayment({ 
  listingId, 
  address,
  onTransactionHash,
  onTransactionCreated,
  onPaymentComplete 
}: UseEscrowPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');
  
  const { toast } = useToast();
  const { getContract } = useEscrowContract();
  const { createTransaction, updateTransactionStatus } = useTransactionUpdater();
  const { ensureCorrectNetwork } = useNetworkSwitch();

  const handlePayment = async () => {
    if (!address) {
      setError("Veuillez connecter votre portefeuille pour continuer");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      console.log('🔹 Starting payment process for listing:', listingId);

      // S'assurer que nous sommes sur le bon réseau
      await ensureCorrectNetwork();

      // Get the authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        console.error('🚨 Auth error: No user found');
        throw new Error("Vous devez être connecté pour effectuer un paiement");
      }

      // Récupérer les détails de l'annonce
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

      if (listingError || !listing || !listing.crypto_amount) {
        console.error('🚨 Error fetching listing:', listingError);
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      // Utiliser l'adresse du wallet de l'annonce, sinon celle du profil vendeur
      const sellerAddress = listing.wallet_address || listing.user?.wallet_address;
      if (!sellerAddress) {
        throw new Error("L'adresse du vendeur n'est pas disponible");
      }

      if (sellerAddress.toLowerCase() === address.toLowerCase()) {
        throw new Error("Vous ne pouvez pas acheter votre propre annonce");
      }

      // Initialiser le provider et vérifier le solde
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const balance = await provider.getBalance(address);
      const amountInWei = ethers.utils.parseEther(listing.crypto_amount.toString());

      if (balance.lt(amountInWei)) {
        throw new Error("Fonds insuffisants dans votre portefeuille");
      }

      // Get contract instance
      const contract = await getContract("0xe35a0cebf608bff98bcf99093b02469eea2cb38c");
      if (!contract) {
        throw new Error("Impossible d'initialiser le contrat");
      }

      console.log("🟢 Contract instance initialized");

      // Estimation des frais de gas
      const gasPrice = await provider.getGasPrice();
      const estimatedGasLimit = await contract.estimateGas.confirmTransaction(sellerAddress, {
        value: amountInWei
      });

      const totalCost = amountInWei.add(gasPrice.mul(estimatedGasLimit));
      if (balance.lt(totalCost)) {
        throw new Error("Fonds insuffisants pour couvrir les frais de transaction");
      }

      console.log("🔹 Transaction parameters:", {
        seller: sellerAddress,
        amount: ethers.utils.formatEther(amountInWei),
        gasLimit: estimatedGasLimit.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
      });

      // Exécuter la transaction
      const tx = await contract.confirmTransaction(sellerAddress, {
        value: amountInWei,
        gasLimit: estimatedGasLimit.mul(120).div(100), // +20% marge de sécurité
        gasPrice: gasPrice.mul(120).div(100) // +20% sur le gas price
      });

      console.log("🟢 Transaction sent:", tx.hash);
      if (onTransactionHash) {
        onTransactionHash(tx.hash);
      }

      const receipt = await tx.wait();
      console.log("🟢 Transaction confirmed:", receipt);

      // Créer l'entrée transaction en base de données
      const transaction = await createTransaction(
        listingId,
        authUser.id,
        listing.user.id,
        listing.crypto_amount,
        listing.crypto_amount * 0.05,
        contract.address,
        80001, // Chain ID for Polygon Amoy
        sellerAddress
      );

      if (receipt.status === 1) {
        const txnId = receipt.logs[0].topics[1];
        await updateTransactionStatus(transaction.id, 'processing', tx.hash, txnId);

        if (onTransactionCreated) {
          onTransactionCreated(transaction.id);
        }

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
      console.error('🚨 Payment error:', error);
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
