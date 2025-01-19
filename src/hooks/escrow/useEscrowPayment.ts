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

      try {
        const amountInWei = parseEther(validatedListing.crypto_amount.toString());
        console.log('Amount in Wei:', amountInWei.toString());

        // Vérifier le solde avant la transaction
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        
        if (BigInt(balance) < BigInt(amountInWei.toString())) {
          throw new Error("Fonds insuffisants dans votre portefeuille");
        }

        // Obtenir l'instance du contrat
        const escrow = await getContract(escrowContract.address);
        if (!escrow) throw new Error("Impossible d'initialiser le contrat");

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

        // Envoyer la transaction
        console.log('Sending transaction with parameters:', {
          seller: validatedListing.user.wallet_address,
          value: amountInWei.toString()
        });

        const tx = await escrow.constructor(validatedListing.user.wallet_address, {
          value: amountInWei
        });

        console.log('Transaction sent:', tx.hash);
        setTransactionStatus('pending');
        
        if (onTransactionHash) {
          onTransactionHash(tx.hash);
        }

        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);

        if (receipt.status === 1) {
          await updateTransactionStatus(transaction.id, 'processing', tx.hash);
          
          // Mettre à jour le statut des fonds comme sécurisés
          await supabase
            .from('transactions')
            .update({
              funds_secured: true,
              funds_secured_at: new Date().toISOString()
            })
            .eq('id', transaction.id);

          setTransactionStatus('confirmed');
          toast({
            title: "Transaction confirmée",
            description: "Les fonds ont été sécurisés dans le contrat d'escrow",
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
        
        const errorMessage = txError.reason || txError.message || "La transaction a échoué";
        toast({
          title: "Erreur de transaction",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
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