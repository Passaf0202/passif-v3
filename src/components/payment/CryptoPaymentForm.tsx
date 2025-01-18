import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAccount } from 'wagmi';
import { TransactionDetails } from "./TransactionDetails";
import { EscrowAlert } from "./EscrowAlert";
import { PaymentButton } from "./PaymentButton";
import { useEscrowPayment } from "@/hooks/useEscrowPayment";

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
  const { address, isConnected } = useAccount();
  const { 
    isProcessing, 
    error, 
    escrowError, 
    handlePayment 
  } = useEscrowPayment({ 
    listingId, 
    address, 
    onPaymentComplete 
  });

  return (
    <div className="space-y-6">
      <TransactionDetails 
        title={title}
        price={price}
        cryptoAmount={cryptoAmount}
        cryptoCurrency={cryptoCurrency}
      />

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {escrowError && (
        <EscrowAlert 
          escrowError={escrowError}
          onPayWithEscrowFees={() => handlePayment(true)}
        />
      )}

      <PaymentButton 
        isProcessing={isProcessing}
        isConnected={isConnected}
        cryptoAmount={cryptoAmount}
        cryptoCurrency={cryptoCurrency}
        onClick={() => handlePayment(false)}
      />
    </div>
  );
}