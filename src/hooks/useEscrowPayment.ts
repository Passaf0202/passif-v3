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

      // Récupérer le taux BNB actuel
      const { data: cryptoRate } = await supabase
        .from('crypto_rates')
        .select('*')
        .eq('symbol', 'BNB')
        .eq('is_active', true)
        .maybeSingle();

      if (!cryptoRate) {
        console.error('No active BNB rate found');
        throw new Error("Impossible de récupérer le taux de conversion BNB");
      }

      // Calculer ou vérifier le montant en crypto
      let cryptoAmount = listing.crypto_amount;
      if (!cryptoAmount || typeof cryptoAmount !== 'number' || cryptoAmount <= 0) {
        cryptoAmount = Number(listing.price) / cryptoRate.rate_eur;
        console.log('Calculated new crypto amount:', {
          price: listing.price,
          rate: cryptoRate.rate_eur,
          amount: cryptoAmount
        });

        // Mettre à jour l'annonce avec le nouveau montant
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
      }

      // Récupérer le contrat d'escrow actif
      const escrowContract = await getActiveContract();
      if (!escrowContract) {
        console.error('No active escrow contract found');
        throw new Error("Le contrat d'escrow n'est pas disponible");
      }

      console.log('Payment details:', {
        amount: cryptoAmount,
        sellerAddress: listing.user.wallet_address,
        escrowAddress: escrowContract.address,
        network: 'BSC Testnet',
        chainId: escrowContract.chain_id
      });

      // Créer la transaction dans la base de données
      const transaction = await createTransaction(
        listingId,
        address,
        listing.user.id,
        cryptoAmount,
        0,
        escrowContract.address,
        escrowContract.chain_id
      );

      // Obtenir l'instance du contrat
      const escrow = await getContract(escrowContract.address);
      if (!escrow) {
        console.error('Failed to initialize contract');
        throw new Error("Impossible d'initialiser le contrat");
      }

      try {
        const amountInWei = parseEther(cryptoAmount.toString());
        console.log('Amount in Wei:', amountInWei.toString());

        // Vérifier la balance avant la transaction
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        
        if (BigInt(balance) < BigInt(amountInWei.toString())) {
          throw new Error("Fonds insuffisants dans votre portefeuille");
        }

        // Configuration spécifique pour BSC
        const gasLimit = 200000;
        const gasPrice = await window.ethereum.request({
          method: 'eth_gasPrice'
        });

        // Envoyer la transaction
        const tx = await escrow.deposit(
          listing.user.wallet_address,
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