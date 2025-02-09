
import { useState } from "react";
import { useEscrowPayment } from "@/hooks/useEscrowPayment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { EscrowAlert } from "./EscrowAlert";
import { TransactionDetails } from "./TransactionDetails";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCryptoRates } from "@/hooks/useCryptoRates";
import { useCryptoConversion } from "@/hooks/useCryptoConversion";
import { PaymentButton } from "./PaymentButton";

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
  const [selectedCurrency, setSelectedCurrency] = useState(initialCryptoCurrency);
  const { data: cryptoRates, isLoading: isLoadingRates } = useCryptoRates();
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  const convertedAmount = useCryptoConversion(price, listingId, selectedCurrency);
  
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

  if (!convertedAmount && !initialCryptoAmount) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Calcul du montant en cours...</span>
      </div>
    );
  }

  const finalCryptoAmount = convertedAmount?.amount || initialCryptoAmount;
  const finalCryptoCurrency = convertedAmount?.currency || selectedCurrency;

  const availableCurrencies = [
    { symbol: "BNB", name: "Binance Coin" },
    { symbol: "USDT", name: "Tether" },
    { symbol: "USDC", name: "USD Coin" }
  ];

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
            cryptoCurrency={finalCryptoCurrency}
          />

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sélectionnez une cryptomonnaie</label>
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une cryptomonnaie" />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((currency) => (
                    <SelectItem key={currency.symbol} value={currency.symbol}>
                      {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              cryptoAmount={finalCryptoAmount}
              cryptoCurrency={finalCryptoCurrency}
              disabled={isProcessing || !finalCryptoAmount}
              transactionId={transactionId}
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
