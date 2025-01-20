import { useState } from "react";
import { useEscrowPayment } from "@/hooks/useEscrowPayment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { EscrowAlert } from "./EscrowAlert";
import { TransactionDetails } from "./TransactionDetails";
import { useAccount } from 'wagmi';

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
  cryptoCurrency = "BNB",
  onPaymentComplete,
}: CryptoPaymentFormProps) {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const [showEscrowInfo, setShowEscrowInfo] = useState(false);
  
  const {
    handlePayment,
    isProcessing,
    error,
    transactionStatus,
  } = useEscrowPayment({
    listingId,
    address: user?.id,
    onPaymentComplete,
  });

  if (!cryptoAmount) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Calcul du montant en cours...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paiement sécurisé</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionDetails
            title={title}
            price={price}
            cryptoAmount={cryptoAmount}
            cryptoCurrency={cryptoCurrency}
          />

          <div className="mt-6">
            <Button
              onClick={() => setShowEscrowInfo(true)}
              variant="outline"
              className="w-full mb-4"
            >
              <Shield className="mr-2 h-4 w-4" />
              Comment fonctionne le paiement sécurisé ?
            </Button>

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
              ) : !isConnected ? (
                "Connectez votre portefeuille"
              ) : (
                `Payer ${cryptoAmount.toFixed(6)} ${cryptoCurrency}`
              )}
            </Button>

            {error && (
              <p className="text-red-500 text-sm mt-2">
                Erreur: {error}
              </p>
            )}

            {transactionStatus === 'confirmed' && (
              <p className="text-green-500 text-sm mt-2">
                Transaction confirmée !
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <EscrowAlert
        open={showEscrowInfo}
        onClose={() => setShowEscrowInfo(false)}
      />
    </div>
  );
}