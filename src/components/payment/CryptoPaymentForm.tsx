
import { useState } from "react";
import { useEscrowPayment } from "@/hooks/escrow/useEscrowPayment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { EscrowAlert } from "./EscrowAlert";
import { TransactionDetails } from "./TransactionDetails";
import { PaymentButton } from "./PaymentButton";
import { useNavigate } from "react-router-dom";

interface CryptoPaymentFormProps {
  listingId: string;
  title: string;
  price: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  sellerAddress?: string;
  onPaymentComplete: () => void;
}

export function CryptoPaymentForm({
  listingId,
  title,
  price,
  cryptoAmount: initialCryptoAmount,
  cryptoCurrency = "BNB",
  sellerAddress,
  onPaymentComplete,
}: CryptoPaymentFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEscrowInfo, setShowEscrowInfo] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  const {
    handlePayment,
    isProcessing,
    error,
    transactionStatus,
  } = useEscrowPayment({
    listingId,
    address: user?.id,
    onTransactionCreated: (id: string) => {
      setTransactionId(id);
      navigate(`/release-funds/${id}`);
    },
    onPaymentComplete
  });

  if (!initialCryptoAmount) {
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
            cryptoAmount={initialCryptoAmount}
            cryptoCurrency={cryptoCurrency}
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

            <PaymentButton
              onClick={handlePayment}
              isProcessing={isProcessing}
              isConnected={!!user}
              cryptoAmount={initialCryptoAmount}
              cryptoCurrency={cryptoCurrency}
              disabled={isProcessing || !initialCryptoAmount}
              sellerAddress={sellerAddress}
              mode="pay"
            />

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
