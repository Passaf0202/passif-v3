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

      // Vérification stricte du montant en crypto
      if (!listing.crypto_amount || typeof listing.crypto_amount !== 'number' || listing.crypto_amount <= 0) {
        console.error('Invalid crypto amount:', {
          amount: listing.crypto_amount,
          type: typeof listing.crypto_amount
        });
        throw new Error("Le montant en crypto n'est pas valide");
      }

      // Récupérer le contrat d'escrow actif
      const escrowContract = await getActiveContract();
      if (!escrowContract) {
        throw new Error("Le contrat d'escrow n'est pas disponible");
      }

      console.log('Payment details:', {
        amount: listing.crypto_amount,
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
        listing.crypto_amount,
        0,
        escrowContract.address,
        escrowContract.chain_id
      );

      // Obtenir l'instance du contrat
      const escrow = await getContract(escrowContract.address);
      if (!escrow) throw new Error("Impossible d'initialiser le contrat");

      try {
        const amountInWei = parseEther(listing.crypto_amount.toString());
        console.log('Amount in Wei:', amountInWei.toString());

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