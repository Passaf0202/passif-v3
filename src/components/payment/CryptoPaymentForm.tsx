import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAccount } from 'wagmi';
import { TransactionDetails } from "./TransactionDetails";
import { EscrowAlert } from "./EscrowAlert";
import { PaymentButton } from "./PaymentButton";
import { useEscrowPayment } from "@/hooks/useEscrowPayment";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [confirmations, setConfirmations] = useState(0);
  
  const { 
    isProcessing, 
    error, 
    escrowError,
    transactionStatus,
    handlePayment 
  } = useEscrowPayment({ 
    listingId, 
    address,
    onTransactionHash: (hash) => setTransactionHash(hash),
    onConfirmation: (confirmationCount) => setConfirmations(confirmationCount),
    onPaymentComplete 
  });

  useEffect(() => {
    if (transactionStatus === 'confirmed') {
      toast({
        title: "Transaction confirmée",
        description: `Les fonds ont été bloqués avec succès. Ils seront libérés une fois que l'acheteur et le vendeur auront confirmé la transaction.`,
      });
    }
  }, [transactionStatus, confirmations, toast]);

  return (
    <div className="space-y-6">
      <TransactionDetails 
        title={title}
        price={price}
        cryptoAmount={cryptoAmount}
        cryptoCurrency={cryptoCurrency}
      />

      {transactionHash && (
        <Alert>
          <AlertDescription className="flex flex-col gap-2">
            <p>Hash de transaction : {transactionHash}</p>
            <p>Confirmations : {confirmations}</p>
            <p>Statut : {
              transactionStatus === 'pending' ? 'En attente de confirmation...' :
              transactionStatus === 'confirmed' ? 'Fonds bloqués ✅' :
              transactionStatus === 'failed' ? 'Transaction échouée ❌' :
              'En cours...'
            }</p>
            {transactionStatus === 'pending' && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>En attente de confirmation...</span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {escrowError && (
        <EscrowAlert 
          escrowError={escrowError}
          onPayWithEscrowFees={() => handlePayment()}
        />
      )}

      <PaymentButton 
        isProcessing={isProcessing}
        isConnected={isConnected}
        cryptoAmount={cryptoAmount}
        cryptoCurrency={cryptoCurrency}
        onClick={() => handlePayment()}
        disabled={transactionStatus === 'pending' || transactionStatus === 'confirmed'}
      />
    </div>
  );
}