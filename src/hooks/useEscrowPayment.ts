import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { usePublicClient, useWalletClient } from "wagmi";
import { type SendTransactionParameters } from 'viem';

interface EscrowError {
  available: string;
  required: string;
  missing: string;
}

type TransactionStatus = 'none' | 'pending' | 'confirmed' | 'failed';

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
  const [escrowError, setEscrowError] = useState<EscrowError | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('none');
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const checkTransaction = async () => {
      if (currentHash && transactionStatus === 'pending') {
        try {
          const receipt = await publicClient.getTransactionReceipt({ hash: currentHash as `0x${string}` });
          
          if (receipt) {
            onConfirmation?.(Number(receipt.blockNumber));
            if (receipt.status === 'success') {
              setTransactionStatus('confirmed');
              onPaymentComplete();
            } else {
              setTransactionStatus('failed');
              setError("La transaction a échoué");
            }
          }
        } catch (error) {
          console.error('Error checking transaction:', error);
        }
      }
    };

    if (currentHash && transactionStatus === 'pending') {
      interval = setInterval(checkTransaction, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentHash, transactionStatus, publicClient, onConfirmation, onPaymentComplete]);

  const handlePayment = async (includeEscrowFees: boolean = false) => {
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
            wallet_address
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

      if (!listing.crypto_amount) {
        throw new Error("Le montant en crypto n'est pas disponible");
      }

      console.log('Initiating transaction with params:', {
        listingId,
        buyerAddress: address,
        sellerAddress: listing.user.wallet_address,
        amount: listing.crypto_amount.toString(),
        includeEscrowFees
      });

      // Obtenir la transaction préparée depuis l'Edge Function
      const { data, error } = await supabase.functions.invoke('handle-crypto-payment', {
        body: {
          listingId,
          buyerAddress: address,
          sellerAddress: listing.user.wallet_address,
          amount: listing.crypto_amount.toString(),
          includeEscrowFees
        }
      });

      if (error) {
        console.error('Error preparing transaction:', error);
        throw error;
      }

      if (!data?.transaction) {
        throw new Error("Impossible de préparer la transaction");
      }

      // Préparer les paramètres de transaction avec kzg
      const transactionParameters: SendTransactionParameters = {
        account: address as `0x${string}`,
        to: data.transaction.to as `0x${string}`,
        value: BigInt(data.transaction.value),
        gas: BigInt(data.transaction.gas),
        gasPrice: BigInt(data.transaction.gasPrice),
        chain: undefined,
        kzg: undefined
      };

      // Envoyer la transaction via le wallet connecté
      const hash = await walletClient.sendTransaction(transactionParameters);

      console.log('Transaction sent:', hash);
      setCurrentHash(hash);
      setTransactionStatus('pending');
      onTransactionHash?.(hash);
      
      toast({
        title: "Transaction envoyée",
        description: "La transaction a été envoyée avec succès. Veuillez patienter pendant la confirmation.",
      });

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