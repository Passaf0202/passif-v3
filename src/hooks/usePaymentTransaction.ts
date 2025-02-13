
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { useTransactionCreation } from "@/hooks/useTransactionCreation";
import { TransactionError, TransactionErrorCodes } from "@/utils/escrow/transactionErrors";

interface UsePaymentTransactionProps {
  listingId: string;
  address?: string;
  onTransactionHash?: (hash: string) => void;
  onPaymentComplete: (transactionId: string) => void;
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

  const verifyTransactionAmount = (expectedAmount: ethers.BigNumber, actualAmount: ethers.BigNumber) => {
    console.log("Verifying amounts:", {
      expected: ethers.utils.formatEther(expectedAmount),
      actual: ethers.utils.formatEther(actualAmount)
    });

    if (!expectedAmount.eq(actualAmount)) {
      throw new TransactionError(
        `Montant incorrect. Attendu: ${ethers.utils.formatEther(expectedAmount)} POL, Reçu: ${ethers.utils.formatEther(actualAmount)} POL`,
        TransactionErrorCodes.AMOUNT_MISMATCH
      );
    }
  };

  const handlePayment = async () => {
    if (!address) {
      throw new TransactionError(
        "Veuillez connecter votre portefeuille pour continuer",
        TransactionErrorCodes.SELLER_ADDRESS_MISSING
      );
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
        throw new TransactionError(
          "Impossible de récupérer les détails de l'annonce",
          TransactionErrorCodes.NETWORK_ERROR
        );
      }

      // 2. Vérifier l'adresse du vendeur
      const sellerAddress = listing.user?.wallet_address;
      if (!sellerAddress) {
        throw new TransactionError(
          "L'adresse du vendeur n'est pas disponible",
          TransactionErrorCodes.SELLER_ADDRESS_MISSING
        );
      }

      console.log("Seller wallet address:", sellerAddress);

      // 3. S'assurer d'être sur le bon réseau
      await ensureCorrectNetwork();

      // 4. Vérifier le montant
      if (!listing.crypto_amount || listing.crypto_amount <= 0) {
        throw new TransactionError(
          "Le montant de la transaction est invalide",
          TransactionErrorCodes.INVALID_AMOUNT
        );
      }

      // 5. Créer la transaction Supabase
      const transaction = await createTransaction(
        listingId,
        listing.crypto_amount,
        'POL',
        sellerAddress
      );

      if (onTransactionCreated) {
        onTransactionCreated(transaction.id);
      }

      // 6. Initialiser le contrat
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // 7. Vérifier le solde
      const balance = await provider.getBalance(address);
      const amount = ethers.utils.parseEther(listing.crypto_amount.toString());
      
      if (balance.lt(amount)) {
        throw new TransactionError(
          "Solde insuffisant pour effectuer la transaction",
          TransactionErrorCodes.INSUFFICIENT_FUNDS
        );
      }

      console.log("Balance verification:", {
        balance: ethers.utils.formatEther(balance),
        required: ethers.utils.formatEther(amount)
      });

      // 8. Envoyer la transaction blockchain
      console.log("Sending transaction with amount:", ethers.utils.formatEther(amount));
      const tx = await contract.createTransaction(sellerAddress, { value: amount });
      console.log("Transaction sent:", tx.hash);

      if (onTransactionHash) {
        onTransactionHash(tx.hash);
      }

      // 9. Attendre et vérifier l'événement
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      const event = receipt.events?.find(
        (e: any) => e.event === "FundsDeposited"
      );

      if (!event) {
        throw new TransactionError(
          "Événement FundsDeposited non trouvé",
          TransactionErrorCodes.EVENT_NOT_FOUND
        );
      }

      // 10. Vérifier le montant dans l'événement
      const eventAmount = event.args[2];
      verifyTransactionAmount(amount, eventAmount);

      // 11. Récupérer l'ID blockchain et mettre à jour
      const blockchainTxnId = event.args[0].toString();
      console.log("Blockchain transaction ID from event:", blockchainTxnId);

      await updateTransactionWithBlockchain(
        transaction.id,
        blockchainTxnId,
        tx.hash
      );

      toast({
        title: "Transaction réussie",
        description: "Les fonds ont été déposés dans l'escrow",
      });

      onPaymentComplete(transaction.id);

    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof TransactionError) {
        setError(error.message);
        toast({
          title: "Erreur de transaction",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setError(error.message || "Une erreur est survenue lors du paiement");
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue",
          variant: "destructive",
        });
      }
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
