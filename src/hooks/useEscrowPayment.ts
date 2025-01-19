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

  const validateCryptoAmount = async (listing: any) => {
    if (!listing.crypto_amount || typeof listing.crypto_amount !== 'number' || listing.crypto_amount <= 0) {
      console.error('Invalid or missing crypto amount:', listing.crypto_amount);
      
      // Récupérer le taux BNB actuel
      const { data: cryptoRate, error: rateError } = await supabase
        .from('crypto_rates')
        .select('*')
        .eq('symbol', 'BNB')
        .eq('is_active', true)
        .maybeSingle();

      if (rateError || !cryptoRate) {
        console.error('Error fetching BNB rate:', rateError);
        throw new Error("Impossible de récupérer le taux de conversion BNB");
      }

      if (!cryptoRate.rate_eur || cryptoRate.rate_eur <= 0) {
        console.error('Invalid BNB rate:', cryptoRate.rate_eur);
        throw new Error("Taux de conversion BNB invalide");
      }

      const cryptoAmount = Number(listing.price) / cryptoRate.rate_eur;
      
      if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
        console.error('Calculated invalid crypto amount:', {
          price: listing.price,
          rate: cryptoRate.rate_eur,
          result: cryptoAmount
        });
        throw new Error("Erreur lors du calcul du montant en crypto");
      }

      // Mettre à jour l'annonce avec le montant calculé
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          crypto_amount: cryptoAmount,
          crypto_currency: 'BNB'
        })
        .eq('id', listing.id);

      if (updateError) {
        console.error('Error updating listing with crypto amount:', updateError);
        throw new Error("Erreur lors de la mise à jour du montant en crypto");
      }

      listing.crypto_amount = cryptoAmount;
      listing.crypto_currency = 'BNB';
    }

    return listing;
  };

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

      // Valider et potentiellement mettre à jour le montant en crypto
      const validatedListing = await validateCryptoAmount(listing);
      console.log('Validated listing:', validatedListing);

      // Récupérer le contrat d'escrow actif
      const escrowContract = await getActiveContract();
      if (!escrowContract) {
        throw new Error("Le contrat d'escrow n'est pas disponible");
      }

      console.log('Payment details:', {
        amount: validatedListing.crypto_amount,
        sellerAddress: validatedListing.user.wallet_address,
        escrowAddress: escrowContract.address,
        network: 'BSC Testnet',
        chainId: escrowContract.chain_id
      });

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
        const gasLimit = 200000;
        const gasPrice = await window.ethereum.request({
          method: 'eth_gasPrice'
        });

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
          setTransactionStatus('failed');
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