
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { useTransactionCreation } from "@/hooks/useTransactionCreation";

interface UsePaymentTransactionProps {
  listingId: string;
  address?: string;
  onTransactionHash?: (hash: string) => void;
  onPaymentComplete: () => void;
  onTransactionCreated?: (id: string) => void;
}

const ESCROW_ABI = [
  "function createTransaction(address seller) payable returns (uint256)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "event FundsDeposited(uint256 indexed txnId, address buyer, uint256 amount)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export function usePaymentTransaction({ 
  listingId, 
  address,
  onTransactionHash,
  onPaymentComplete,
  onTransactionCreated
}: UsePaymentTransactionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { ensureCorrectNetwork } = useNetworkSwitch();
  const { createTransaction, updateTransactionWithBlockchain } = useTransactionCreation();

  const handlePayment = async () => {
    if (!address) {
      setError("Veuillez connecter votre portefeuille pour continuer");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      console.log('Starting payment process for listing:', listingId);

      // 1. Récupérer les détails de l'annonce
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

      // 2. Vérifier l'adresse du vendeur
      const sellerAddress = listing.user?.wallet_address;
      if (!sellerAddress) {
        throw new Error("L'adresse du vendeur n'est pas disponible");
      }

      console.log("Seller wallet address:", sellerAddress);

      // 3. S'assurer d'être sur le bon réseau
      await ensureCorrectNetwork();

      // 4. Créer la transaction Supabase
      const transaction = await createTransaction(
        listingId,
        listing.crypto_amount || 0,
        'POL',
        sellerAddress
      );

      if (onTransactionCreated) {
        onTransactionCreated(transaction.id);
      }

      // 5. Initialiser le contrat
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // 6. Envoyer la transaction blockchain
      const amount = ethers.utils.parseEther(listing.crypto_amount?.toString() || "0");
      console.log("Sending transaction with amount:", ethers.utils.formatEther(amount));

      const tx = await contract.createTransaction(sellerAddress, { value: amount });
      console.log("Transaction sent:", tx.hash);

      if (onTransactionHash) {
        onTransactionHash(tx.hash);
      }

      // 7. Écouter l'événement FundsDeposited pour récupérer l'ID
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      // Trouver l'événement FundsDeposited
      const event = receipt.events?.find(
        (e: any) => e.event === "FundsDeposited"
      );

      if (!event) {
        throw new Error("Événement FundsDeposited non trouvé");
      }

      // L'ID est le premier argument de l'événement
      const blockchainTxnId = event.args[0].toString();
      console.log("Blockchain transaction ID from event:", blockchainTxnId);

      // 8. Mettre à jour la transaction avec l'ID blockchain
      await updateTransactionWithBlockchain(
        transaction.id,
        blockchainTxnId,
        tx.hash
      );

      toast({
        title: "Transaction réussie",
        description: "Les fonds ont été déposés dans l'escrow",
      });

      onPaymentComplete();

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "Une erreur est survenue lors du paiement");
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
    handlePayment
  };
}
