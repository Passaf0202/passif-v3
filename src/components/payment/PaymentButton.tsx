
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { usePaymentTransaction } from "@/hooks/usePaymentTransaction";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileWalletRedirect } from "./MobileWalletRedirect";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
  sellerAddress?: string;
  listingId: string;
}

export function PaymentButton({ 
  isProcessing: externalIsProcessing, 
  isConnected, 
  onClick,
  disabled = false,
  sellerAddress,
  listingId
}: PaymentButtonProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isWrongNetwork } = useNetworkSwitch();
  const { handlePayment, isProcessing } = usePaymentTransaction({
    listingId,
    address: sellerAddress,
    onPaymentComplete: (transactionId: string) => {
      onClick();
      navigate(`/payment/${transactionId}`);
    }
  });
  const isMobile = useIsMobile();

  const buttonDisabled = isProcessing || externalIsProcessing || !isConnected || disabled || !sellerAddress || !listingId;

  if (isMobile) {
    return (
      <MobileWalletRedirect 
        isProcessing={isProcessing || externalIsProcessing}
        onConfirm={handlePayment}
        action="payment"
      />
    );
  }

  return (
    <div className="w-full space-y-2">
      <Button 
        onClick={handlePayment} 
        disabled={buttonDisabled}
        className="w-full bg-primary hover:bg-primary/90 py-6 h-auto font-medium rounded-md"
      >
        {isProcessing || externalIsProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Transaction en cours...
          </>
        ) : disabled ? (
          "Transaction en attente de confirmation..."
        ) : isWrongNetwork ? (
          "Changer vers Polygon Amoy"
        ) : !isConnected ? (
          "Connecter votre wallet"
        ) : !sellerAddress ? (
          "Adresse du vendeur manquante"
        ) : (
          "Payer"
        )}
      </Button>

      {!isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez connecter votre portefeuille pour effectuer le paiement
        </p>
      )}

      {isWrongNetwork && isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez vous connecter au réseau Polygon Amoy pour payer en POL
        </p>
      )}
    </div>
  );
}
