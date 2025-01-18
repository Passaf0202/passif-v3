import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
}

export function PaymentButton({ 
  isProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency, 
  onClick 
}: PaymentButtonProps) {
  return (
    <>
      <Button 
        onClick={onClick} 
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
    </>
  );
}