import { useEscrowContract } from './useEscrowContract';
import { useTransactionManager } from './useTransactionManager';
import { validateAndUpdateCryptoAmount } from './useCryptoAmount';
import { supabase } from "@/integrations/supabase/client";
import { parseEther } from "viem";
import { useToast } from "@/components/ui/use-toast";

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
  const { getContract, getActiveContract } = useEscrowContract();
  const { toast } = useToast();
  const {
    isProcessing,
    setIsProcessing,
    error,
    setError,
    transactionStatus,
    setTransactionStatus,
    createTransaction,
    updateTransactionStatus
  } = useTransactionManager();

  const handlePayment = async () => {
    if (!address) {
      setError("Veuillez connecter votre portefeuille pour continuer");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      console.log('Starting payment process for listing:', listingId);

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
        .maybeSingle();

      if (listingError || !listing) {
        console.error('Error fetching listing:', listingError);
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      if (!listing.user?.wallet_address) {
        console.error('No wallet address found for seller');
        throw new Error("Le vendeur n'a pas connecté son portefeuille");
      }

      // Valider et mettre à jour le montant en crypto si nécessaire
      const validatedListing = await validateAndUpdateCryptoAmount(listing);
      console.log('Validated listing:', validatedListing);

      // Récupérer le contrat d'escrow actif
      const escrowContract = await getActiveContract();
      if (!escrowContract) {
        throw new Error("Le contrat d'escrow n'est pas disponible");
      }

      // Créer la transaction dans la base de données
      const transaction = await createTransaction(
        listingId,
        address,
        validatedListing.user.id,
        validatedListing.crypto_amount,
        0,
        escrowContract.address,
        escrowContract.chain_id
      );

      // Obtenir l'instance du contrat
      const escrow = await getContract(escrowContract.address);
      if (!escrow) throw new Error("Impossible d'initialiser le contrat");

      try {
        const amountInWei = parseEther(validatedListing.crypto_amount.toString());
        console.log('Amount in Wei:', amountInWei.toString());

        // Configuration spécifique pour BSC
        const gasLimit = 300000; // Augmenté pour plus de marge
        const gasPrice = await window.ethereum.request({
          method: 'eth_gasPrice'
        });

        console.log('Transaction parameters:', {
          seller: validatedListing.user.wallet_address,
          value: amountInWei.toString(),
          gasLimit,
          gasPrice
        });

        // Vérifier le solde avant la transaction
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        
        if (BigInt(balance) < BigInt(amountInWei.toString())) {
          throw new Error("Fonds insuffisants dans votre portefeuille");
        }

        // Envoyer la transaction
        const tx = await escrow.deposit(
          validatedListing.user.wallet_address,
          { 
            value: amountInWei,
            gasLimit: gasLimit,
            gasPrice: gasPrice
          }
        );

        console.log('Transaction sent:', tx.hash);
        setTransactionStatus('pending');
        
        if (onTransactionHash) {
          onTransactionHash(tx.hash);
        }

        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);

        if (receipt.status === 1) {
          await updateTransactionStatus(transaction.id, 'processing', tx.hash);
          setTransactionStatus('confirmed');
          toast({
            title: "Transaction confirmée",
            description: "Le paiement a été effectué avec succès",
          });
          onPaymentComplete();
        } else {
          console.error('Transaction failed:', receipt);
          setTransactionStatus('failed');
          throw new Error("La transaction a échoué sur la blockchain");
        }
      } catch (txError: any) {
        console.error('Transaction error:', txError);
        
        if (txError.code === 'INSUFFICIENT_FUNDS') {
          toast({
            title: "Fonds insuffisants",
            description: "Votre portefeuille ne contient pas assez de BNB pour effectuer cette transaction",
            variant: "destructive",
          });
          throw new Error("Fonds insuffisants dans votre portefeuille");
        }
        
        // Vérifier si c'est une erreur de revert
        if (txError.code === 'CALL_EXCEPTION') {
          const reason = txError.reason || "La transaction a été rejetée par le contrat";
          toast({
            title: "Erreur de transaction",
            description: reason,
            variant: "destructive",
          });
          throw new Error(reason);
        }
        
        throw txError;
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