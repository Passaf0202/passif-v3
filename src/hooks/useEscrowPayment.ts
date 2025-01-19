import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from "viem";
import { ethers } from "ethers";

const ESCROW_ABI = [
  "constructor(address _seller) payable",
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
  const [escrowError, setEscrowError] = useState<null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  
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
      setEscrowError(null);
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
        .single();

      if (listingError || !listing) {
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      if (!listing.user?.wallet_address) {
        throw new Error("Le vendeur n'a pas connecté son portefeuille");
      }

      // Calculer la commission (2% du montant)
      const commission = Number(listing.crypto_amount) * 0.02;
      const totalAmount = Number(listing.crypto_amount) + commission;

      // Déployer le contrat d'escrow
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const escrowFactory = new ethers.ContractFactory(
        ESCROW_ABI,
        "0x...", // Bytecode will be added after contract deployment
        signer
      );

      const escrowContract = await escrowFactory.deploy(
        listing.user.wallet_address,
        { value: parseEther(totalAmount.toString()) }
      );

      const deployTx = await escrowContract.waitForDeployment();
      const escrowAddress = await escrowContract.getAddress();
      console.log('Escrow contract deployed at:', escrowAddress);

      // Créer la transaction dans la base de données
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
          smart_contract_address: escrowAddress
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
        throw new Error("Erreur lors de la création de la transaction");
      }

      const receipt = await deployTx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        // Mettre à jour la transaction pour indiquer que les fonds sont sécurisés
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            funds_secured: true,
            funds_secured_at: new Date().toISOString(),
            transaction_hash: receipt.hash,
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
          description: "Les fonds ont été bloqués avec succès. Ils seront libérés une fois que l'acheteur et le vendeur auront confirmé la transaction.",
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
    escrowError,
    transactionStatus,
    handlePayment
  };
}