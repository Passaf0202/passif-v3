import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from "viem";
import { ethers } from "ethers";

const ESCROW_ABI = [
  "constructor(address _seller) payable",
  "function deposit(address _seller) external payable",
  "function confirmTransaction() public",
  "function getStatus() public view returns (bool, bool, bool)",
  "event FundsDeposited(address buyer, address seller, uint256 amount)",
  "event TransactionConfirmed(address confirmer)",
  "event FundsReleased(address seller, uint256 amount)"
];

interface UseEscrowPaymentProps {
  listingId: string;
  address?: string;
  onTransactionHash?: (hash: string) => void;
  onConfirmation?: (confirmations: number) => void;
  onPaymentComplete: () => void;
}

export function useEscrowPayment({ 
  listingId, 
  address,
  onTransactionHash,
  onConfirmation,
  onPaymentComplete 
}: UseEscrowPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');
  
  const { toast } = useToast();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handlePayment = async () => {
    if (!address || !walletClient) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre portefeuille pour continuer",
        variant: "destructive",
      });
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
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      if (!listing.user?.wallet_address) {
        throw new Error("Le vendeur n'a pas connecté son portefeuille");
      }

      // Récupérer le contrat d'escrow actif
      const { data: escrowContract, error: escrowError } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('name', 'Escrow')
        .eq('is_active', true)
        .maybeSingle();

      if (escrowError) {
        console.error('Error fetching escrow contract:', escrowError);
        throw new Error("Erreur lors de la récupération du contrat d'escrow");
      }

      if (!escrowContract) {
        throw new Error("Le contrat d'escrow n'est pas disponible. Veuillez contacter le support.");
      }

      // Calculer la commission (2% du montant)
      const commission = Number(listing.crypto_amount) * 0.02;
      const totalAmount = Number(listing.crypto_amount) + commission;

      console.log('Payment details:', {
        amount: totalAmount,
        sellerAddress: listing.user.wallet_address,
        escrowAddress: escrowContract.address
      });

      // Créer la transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          listing_id: listingId,
          buyer_id: address,
          seller_id: listing.user.id,
          amount: listing.crypto_amount,
          commission_amount: commission,
          token_symbol: listing.crypto_currency || 'BNB',
          status: 'pending',
          escrow_status: 'pending',
          smart_contract_address: escrowContract.address,
          chain_id: escrowContract.chain_id,
          network: escrowContract.network
        })
        .select()
        .single();

      if (transactionError || !transaction) {
        console.error('Transaction creation error:', transactionError);
        throw new Error("Erreur lors de la création de la transaction");
      }

      // Envoyer la transaction
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const escrow = new ethers.Contract(
        escrowContract.address,
        ESCROW_ABI,
        signer
      );

      console.log('Initiating transaction with contract:', escrowContract.address);

      const tx = await escrow.deposit(
        listing.user.wallet_address,
        { value: parseEther(totalAmount.toString()) }
      );

      console.log('Transaction sent:', tx.hash);
      setTransactionStatus('pending');
      
      if (onTransactionHash) {
        onTransactionHash(tx.hash);
      }

      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        // Mettre à jour la transaction
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            funds_secured: true,
            funds_secured_at: new Date().toISOString(),
            transaction_hash: receipt.transactionHash,
            status: 'processing'
          })
          .eq('id', transaction.id);

        if (updateError) {
          console.error('Error updating transaction:', updateError);
          throw new Error("Erreur lors de la mise à jour de la transaction");
        }

        setTransactionStatus('confirmed');
        onPaymentComplete();
        
        toast({
          title: "Succès",
          description: "Les fonds ont été bloqués avec succès",
        });
      } else {
        setTransactionStatus('failed');
        throw new Error("La transaction a échoué");
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "Une erreur est survenue lors du paiement");
      setTransactionStatus('failed');
      toast({
        title: "Erreur de paiement",
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