
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSellerAddress } from "@/hooks/escrow/useSellerAddress";
import { useReleaseFunds } from "@/hooks/escrow/useReleaseFunds";
import { CompletedTransactionAlert } from "./CompletedTransactionAlert";
import { ReleaseButton } from "./ReleaseButton";

interface FundsReleaseSectionProps {
  transactionId: string;
  blockchainTxnId?: string;
  isConfirmed: boolean;
}

export function FundsReleaseSection({
  transactionId,
  blockchainTxnId,
  isConfirmed,
}: FundsReleaseSectionProps) {
  const sellerAddress = useSellerAddress(transactionId);
  const { isReleasing, handleReleaseFunds } = useReleaseFunds(
    transactionId,
    blockchainTxnId,
    sellerAddress
  );

  if (!sellerAddress) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          L'adresse du vendeur est manquante. Cette information est nécessaire pour libérer les fonds.
        </AlertDescription>
      </Alert>
    );
  }

  if (isConfirmed) {
    return <CompletedTransactionAlert />;
  }

  return (
    <>
      <Alert>
        <AlertDescription>
          Une fois que vous aurez reçu l'article, cliquez sur le bouton ci-dessous pour libérer les fonds au vendeur.
        </AlertDescription>
      </Alert>

      <ReleaseButton 
        isReleasing={isReleasing}
        onRelease={handleReleaseFunds}
      />
    </>
  );
}
