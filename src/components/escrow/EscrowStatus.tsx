
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EscrowLoadingButton } from "./EscrowLoadingButton";
import { useFundsRelease } from "./useFundsRelease";

interface EscrowStatusProps {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  currentUserId: string;
  sellerWalletAddress?: string;
}

export function EscrowStatus({
  transactionId,
  buyerId,
  sellerId,
  currentUserId,
  sellerWalletAddress
}: EscrowStatusProps) {
  const isUserBuyer = currentUserId === buyerId;
  const { isLoading, handleReleaseFunds } = useFundsRelease(transactionId);

  return (
    <div className="space-y-4">
      {isUserBuyer ? (
        <EscrowLoadingButton
          isLoading={isLoading}
          onClick={handleReleaseFunds}
        />
      ) : (
        <Alert>
          <AlertDescription>
            En tant que vendeur, vous recevrez les fonds une fois que l'acheteur les aura libérés.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
