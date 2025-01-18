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

      // Créer la fenêtre de paiement via l'Edge Function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-coinbase-payment', {
        body: {
          listingId,
          buyerAddress: address,
          sellerAddress: listing.user.wallet_address,
          amount: listing.price.toString(),
          cryptoCurrency: listing.crypto_currency || 'BNB',
          includeEscrowFees
        }
      });

      if (paymentError || !paymentData?.hosted_url) {
        console.error('Error creating payment:', paymentError || 'No payment URL received');
        throw new Error("Impossible de créer la transaction de paiement");
      }

      // Ouvrir la fenêtre de paiement
      const paymentWindow = window.open(paymentData.hosted_url, 'Payment Window', 'width=600,height=800');
      
      if (!paymentWindow) {
        throw new Error("Impossible d'ouvrir la fenêtre de paiement. Veuillez autoriser les popups.");
      }

      // Écouter les messages de la fenêtre de paiement
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'PAYMENT_SUCCESS') {
          setTransactionStatus('confirmed');
          onPaymentComplete();
          window.removeEventListener('message', handleMessage);
          paymentWindow.close();
        }
      };

      window.addEventListener('message', handleMessage);

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