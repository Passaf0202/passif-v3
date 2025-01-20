import { useEscrowContract } from './escrow/useEscrowContract';
import { useTransactionManager } from './escrow/useTransactionManager';
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
  const { getContract } = useEscrowContract();
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

      if (!listing.crypto_amount || !listing.crypto_currency) {
        console.error('Missing crypto details:', { amount: listing.crypto_amount, currency: listing.crypto_currency });
        throw new Error("Les détails de la crypto-monnaie ne sont pas définis pour cette annonce");
      }

      // Vérifier que la crypto-monnaie est BNB
      if (listing.crypto_currency !== 'BNB') {
        throw new Error("Cette annonce n'accepte que les paiements en BNB");
      }

      // Récupérer le contrat actif
      const { data: activeContract } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('is_active', true)
        .eq('network', 'bsc_testnet')
        .single();

      if (!activeContract) {
        throw new Error("Aucun contrat actif trouvé");
      }

      // Récupérer le contrat avec l'adresse
      const escrow = await getContract(activeContract.address);
      if (!escrow) throw new Error("Impossible d'initialiser le contrat");

      console.log('Payment details:', {
        amount: listing.crypto_amount,
        sellerAddress: listing.user.wallet_address,
        buyerAddress: address,
        contractAddress: activeContract.address
      });

      // Créer la transaction dans la base de données
      const transaction = await createTransaction(
        listingId,
        address,
        listing.user.id,
        listing.crypto_amount,
        0,
        activeContract.address,
        activeContract.chain_id
      );

      try {
        const amountInWei = parseEther(listing.crypto_amount.toString());
        console.log('Amount in Wei:', amountInWei);

        // Configuration spécifique pour BSC
        const gasLimit = 200000;
        
        // Envoyer la transaction
        const tx = await escrow.deposit(listing.user.wallet_address, {
          value: amountInWei,
          gasLimit: gasLimit
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
          setTransactionStatus('confirmed');
          toast({
            title: "Transaction confirmée",
            description: "Le paiement a été effectué avec succès",
          });
          onPaymentComplete();
        } else {
          throw new Error("La transaction a échoué");
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