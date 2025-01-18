import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Info } from "lucide-react";
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

interface EscrowError {
  available: string;
  required: string;
  missing: string;
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
  const [escrowError, setEscrowError] = useState<EscrowError | null>(null);
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePayment = async (includeEscrowFees: boolean = false) => {
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

      console.log('Initiating transaction with params:', {
        listingId,
        buyerAddress: address,
        sellerAddress: listing.user.wallet_address,
        amount: cryptoAmount,
        includeEscrowFees
      });

      const { data, error } = await supabase.functions.invoke('handle-crypto-payment', {
        body: {
          listingId,
          buyerAddress: address,
          sellerAddress: listing.user.wallet_address,
          amount: cryptoAmount.toString(),
          includeEscrowFees
        }
      });

      if (error) {
        // Vérifier si c'est une erreur de fonds insuffisants dans l'escrow
        if (error.message?.includes('insufficient funds')) {
          try {
            const errorDetails = JSON.parse(error.message);
            const match = errorDetails.error.match(/have (\d+) want (\d+)/);
            if (match) {
              const [, have, want] = match;
              const missing = (Number(want) - Number(have)) / 1e18; // Convertir de wei en ETH
              setEscrowError({
                available: (Number(have) / 1e18).toFixed(6),
                required: (Number(want) / 1e18).toFixed(6),
                missing: missing.toFixed(6)
              });
              return;
            }
          } catch (e) {
            console.error('Error parsing escrow error:', e);
          }
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

        {escrowError && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-4">
              <p>Le service d'escrow nécessite un rechargement. Vous pouvez :</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Attendre que le service soit rechargé (quelques heures)</li>
                <li>Payer les frais d'escrow vous-même (+{escrowError.missing} ETH)</li>
              </ul>
              <Button 
                variant="outline"
                onClick={() => handlePayment(true)}
                disabled={isProcessing}
                className="w-full mt-2"
              >
                Payer avec les frais d'escrow
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={() => handlePayment(false)} 
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