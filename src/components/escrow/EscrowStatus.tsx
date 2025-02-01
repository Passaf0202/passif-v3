import { EscrowAlerts } from "./EscrowAlerts";
import { EscrowConfirmButton } from "./EscrowConfirmButton";
import { useEscrowTransaction } from "./hooks/useEscrowTransaction";

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
  currentUserId
}: EscrowStatusProps) {
  const {
    status,
    hasConfirmed,
    fundsSecured,
    isLoading,
    setIsLoading,
    getStoredTxnId,
    setHasConfirmed
  } = useEscrowTransaction(transactionId);

  const isUserBuyer = currentUserId === buyerId;

  return (
    <div className="space-y-4">
      <EscrowAlerts
        status={status}
        hasConfirmed={hasConfirmed}
        fundsSecured={fundsSecured}
        isUserBuyer={isUserBuyer}
      />

      {status === "pending" && !hasConfirmed && isUserBuyer && (
        <EscrowConfirmButton
          transactionId={transactionId}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          getStoredTxnId={getStoredTxnId}
          onConfirmation={() => setHasConfirmed(true)}
        />
      )}
    </div>
  );
}