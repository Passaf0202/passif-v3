
import { EscrowAlerts } from "./EscrowAlerts";
import { EscrowActionButton } from "./EscrowActionButton";
import { useEscrowRelease } from "./hooks/useEscrowRelease";

interface EscrowStatusProps {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  currentUserId: string;
}

export function EscrowStatus({
  transactionId,
  buyerId,
  sellerId,
  currentUserId,
}: EscrowStatusProps) {
  const isUserBuyer = currentUserId === buyerId;
  const { isLoading, handleReleaseFunds } = useEscrowRelease(transactionId);

  return (
    <div className="space-y-4">
      <EscrowAlerts isUserBuyer={isUserBuyer} />

      {isUserBuyer && (
        <EscrowActionButton
          isLoading={isLoading}
          isUserBuyer={isUserBuyer}
          onClick={handleReleaseFunds}
        />
      )}
    </div>
  );
}
