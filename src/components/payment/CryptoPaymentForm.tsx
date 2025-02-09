
import { useState } from "react";
import { useEscrowPayment } from "@/hooks/useEscrowPayment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { EscrowAlert } from "./EscrowAlert";
import { TransactionDetails } from "./TransactionDetails";
import { useCryptoRates } from "@/hooks/useCryptoRates";
import { useCryptoConversion } from "@/hooks/useCryptoConversion";
import { useFundsRelease } from "@/hooks/escrow/useFundsRelease";

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
  cryptoAmount: initialCryptoAmount,
  cryptoCurrency: initialCryptoCurrency = "BNB",
  onPaymentComplete,
}: CryptoPaymentFormProps) {
  const { user } = useAuth();
  const [showEscrowInfo, setShowEscrowInfo] = useState(false);
  const { data: cryptoRates, isLoading: isLoadingRates } = useCryptoRates();
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  const convertedAmount = useCryptoConversion(price, listingId, initialCryptoCurrency);
  
  const {
    handlePayment,
    isProcessing,
    error,
    transactionStatus,
  } = useEscrowPayment({
    listingId,
    address: user?.id,
    onTransactionCreated: (id: string) => setTransactionId(id),
    onPaymentComplete,
  });

  const { isLoading: isReleasingFunds, handleReleaseFunds } = useFundsRelease(transactionId || '');

  if (!convertedAmount && !initialCryptoAmount) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Calcul du montant en cours...</span>
      </div>
    );
  }

  const finalCryptoAmount = convertedAmount?.amount || initialCryptoAmount;

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
            cryptoAmount={finalCryptoAmount}
            cryptoCurrency={initialCryptoCurrency}
          />

          <div className="mt-4 space-y-4">
            <Button
              onClick={() => setShowEscrowInfo(true)}
              variant="outline"
              className="w-full mb-4"
            >
              <Shield className="mr-2 h-4 w-4" />
              Comment fonctionne le paiement sécurisé ?
            </Button>

            {transactionStatus === 'confirmed' ? (
              <Button
                onClick={handleReleaseFunds}
                disabled={isReleasingFunds}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                {isReleasingFunds ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Libération des fonds en cours...
                  </>
                ) : (
                  "Libérer les fonds au vendeur"
                )}
              </Button>
            ) : (
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !finalCryptoAmount || !user}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transaction en cours...
                  </>
                ) : !user ? (
                  "Connectez votre wallet"
                ) : (
                  "Payer"
                )}
              </Button>
            )}

            {error && (
              <p className="text-red-500 text-sm mt-2">
                Erreur: {error}
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
