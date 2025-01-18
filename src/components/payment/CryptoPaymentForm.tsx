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
      console.log('Création du paiement pour l\'annonce:', listingId);

      const { data, error } = await supabase.functions.invoke('create-coinbase-payment', {
        body: { 
          listingId,
          buyerAddress: address,
        }
      });

      if (error) throw error;

      console.log('Réponse du paiement:', data);

      // Rediriger vers la page de paiement Coinbase
      if (data.hosted_url) {
        window.location.href = data.hosted_url;
      } else {
        throw new Error('URL de paiement non trouvée');
      }

    } catch (error) {
      console.error('Erreur de paiement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du paiement",
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
              <span className="font-medium">{price} EUR</span>
            </div>
          </div>

          <Alert className="bg-blue-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Paiement sécurisé via Coinbase Commerce
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
                  Redirection vers Coinbase...
                </>
              ) : (
                `Payer ${price} EUR`
              )}
            </Button>
          )}

          <div className="text-sm text-gray-500 space-y-2">
            <p>• Paiement sécurisé via Coinbase Commerce</p>
            <p>• Support pour de multiples crypto-monnaies</p>
            <p>• Protection acheteur incluse</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}