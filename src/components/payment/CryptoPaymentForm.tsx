import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2, Info } from "lucide-react";
import { useAccount } from 'wagmi';
import { useToast } from "@/components/ui/use-toast";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { supabase } from "@/integrations/supabase/client";

interface CryptoPaymentFormProps {
  listingId: string;
  title: string;
  price: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onPaymentComplete?: () => void;
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
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre portefeuille pour continuer",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Processing payment for listing:', listingId);

      const { data, error } = await supabase.functions.invoke('handle-crypto-payment', {
        body: { 
          listingId,
          buyerAddress: address,
          amount: cryptoAmount,
          currency: cryptoCurrency
        }
      });

      if (error) throw error;

      console.log('Payment response:', data);

      if (data?.transactionHash) {
        toast({
          title: "Succès",
          description: "Votre paiement a été initié avec succès",
        });
        onPaymentComplete?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Paiement en Crypto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">Détails de l'article</h3>
            <p className="text-gray-600">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-medium">{cryptoAmount} {cryptoCurrency}</span>
              <span className="text-gray-500">({price} EUR)</span>
            </div>
          </div>

          <Alert className="bg-blue-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Protection acheteur activée - Paiement sécurisé via smart contract
            </AlertDescription>
          </Alert>

          {!isConnected ? (
            <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
              <Info className="h-5 w-5 mx-auto text-gray-400" />
              <p className="text-gray-600">
                Connectez votre portefeuille pour continuer
              </p>
              <WalletConnectButton />
            </div>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transaction en cours...
                </>
              ) : (
                `Payer ${cryptoAmount} ${cryptoCurrency}`
              )}
            </Button>
          )}

          <div className="text-sm text-gray-500 space-y-2">
            <p>• Le paiement est sécurisé par smart contract</p>
            <p>• Les fonds sont bloqués jusqu'à la réception de l'article</p>
            <p>• Remboursement automatique en cas de litige</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}