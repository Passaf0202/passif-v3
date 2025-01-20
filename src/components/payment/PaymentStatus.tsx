import { Loader2 } from "lucide-react";

interface PaymentStatusProps {
  isProcessing: boolean;
  error: string | null;
  transactionStatus: 'none' | 'pending' | 'confirmed' | 'failed';
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
}

export function PaymentStatus({
  isProcessing,
  error,
  transactionStatus,
  isConnected,
  cryptoAmount,
  cryptoCurrency
}: PaymentStatusProps) {
  if (isProcessing) {
    return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Transaction en cours...
      </>
    );
  }

  if (!isConnected) {
    return "Connectez votre portefeuille";
  }

  return `Payer ${cryptoAmount?.toFixed(6)} ${cryptoCurrency}`;
}