import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from 'wagmi';
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CryptoPaymentFormProps {
  listingId: string;
  title: string;
  price: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onPaymentComplete: () => void;
}

export function CryptoPaymentForm({
  listingId,
  title,
  price,
  cryptoAmount,
  cryptoCurrency,
  onPaymentComplete
}: CryptoPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre portefeuille pour continuer",
        variant: "destructive",
      });
      return;
    }

    if (!cryptoAmount || cryptoAmount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant en crypto n'est pas défini ou invalide",
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

      console.log('Initiating transaction with params:', {
        listingId,
        buyerAddress: address,
        sellerAddress: listing.user.wallet_address,
        amount: cryptoAmount
      });

      const { data, error } = await supabase.functions.invoke('handle-crypto-payment', {
        body: {
          listingId,
          buyerAddress: address,
          sellerAddress: listing.user.wallet_address,
          amount: cryptoAmount.toString()
        }
      });

      if (error) {
        // Vérifier si c'est une erreur de fonds insuffisants dans l'escrow
        if (error.message?.includes('Insufficient funds in escrow account')) {
          setError("Le service de paiement est temporairement indisponible. Veuillez réessayer plus tard ou contacter le support.");
          return;
        }
        throw error;
      }

      console.log('Transaction completed:', data);

      // Mettre à jour le statut de l'annonce
      await supabase
        .from('listings')
        .update({ 
          status: 'sold', 
          payment_status: 'completed',
          crypto_currency: cryptoCurrency,
          crypto_amount: cryptoAmount
        })
        .eq('id', listingId);

      toast({
        title: "Paiement réussi !",
        description: "Votre transaction a été effectuée avec succès",
      });

      onPaymentComplete();

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "Une erreur est survenue lors du paiement");
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement en {cryptoCurrency || 'crypto'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Détails de la transaction</h3>
          <p className="text-sm text-gray-500">Article : {title}</p>
          <p className="text-sm text-gray-500">Prix : {price} EUR</p>
          {cryptoAmount && cryptoCurrency && (
            <p className="text-sm text-gray-500">
              Montant en crypto : {cryptoAmount.toFixed(6)} {cryptoCurrency}
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handlePayment} 
          disabled={isProcessing || !isConnected || !cryptoAmount}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transaction en cours...
            </>
          ) : (
            `Payer avec ${cryptoCurrency || 'crypto'}`
          )}
        </Button>

        {!isConnected && (
          <p className="text-sm text-red-500 text-center">
            Veuillez connecter votre portefeuille pour effectuer le paiement
          </p>
        )}

        {!cryptoAmount && (
          <p className="text-sm text-red-500 text-center">
            Le montant en crypto n'est pas disponible pour le moment
          </p>
        )}
      </CardContent>
    </Card>
  );
}