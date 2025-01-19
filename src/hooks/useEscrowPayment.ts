import { useEscrowContract } from './escrow/useEscrowContract';
import { useTransactionManager } from './escrow/useTransactionManager';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { parseEther } from "viem";

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

  const formatAddress = (address: string): string => {
    // Nettoyer l'adresse
    let cleanAddress = address.trim().toLowerCase();
    
    // Ajouter le préfixe 0x si nécessaire
    if (!cleanAddress.startsWith('0x')) {
      cleanAddress = `0x${cleanAddress}`;
    }
    
    // Vérifier la longueur (42 caractères = 0x + 40 caractères hex)
    if (cleanAddress.length !== 42) {
      throw new Error(`Adresse invalide: ${cleanAddress}`);
    }
    
    // Vérifier que c'est une adresse hexadécimale valide
    if (!/^0x[0-9a-f]{40}$/i.test(cleanAddress)) {
      throw new Error(`Format d'adresse invalide: ${cleanAddress}`);
    }
    
    return cleanAddress;
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

      // Formater et valider l'adresse du vendeur
      const sellerAddress = formatAddress(listing.user.wallet_address);
      console.log('Formatted seller address:', sellerAddress);

      // Récupérer le contrat d'escrow actif
      const escrowContract = await getActiveContract();
      if (!escrowContract) {
        console.error('No active escrow contract found');
        throw new Error("Le contrat d'escrow n'est pas disponible");
      }

      console.log('Payment details:', {
        amount: listing.crypto_amount,
        sellerAddress,
        escrowAddress: escrowContract.address,
        network: 'BSC Testnet',
        chainId: escrowContract.chain_id
      });

      // Créer la transaction dans la base de données
      const transaction = await createTransaction(
        listingId,
        address,
        listing.user.id,
        listing.crypto_amount || 0,
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
        const amountInWei = parseEther(listing.crypto_amount?.toString() || "0");
        console.log('Amount in Wei:', amountInWei.toString());

        // Envoyer la transaction
        const tx = await escrow.deposit(sellerAddress, { value: amountInWei });
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