
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { EscrowStatus } from "@/components/escrow/EscrowStatus";

interface TransactionStatusCardProps {
  transaction: any;
  isUserBuyer: boolean;
  user: any;
  isCancelling: boolean;
  onCancelTransaction: () => void;
}

export function TransactionStatusCard({
  transaction,
  isUserBuyer,
  user,
  isCancelling,
  onCancelTransaction,
}: TransactionStatusCardProps) {
  const getStatusColor = () => {
    switch (transaction.escrow_status) {
      case 'completed':
        return 'bg-green-50';
      case 'cancelled':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getStatusMessage = () => {
    if (transaction.escrow_status === 'cancelled') {
      return "La transaction a été annulée.";
    }
    if (transaction.escrow_status === 'completed') {
      return "La transaction a été complétée avec succès. Les fonds ont été libérés au vendeur.";
    }
    return transaction.funds_secured
      ? "Les fonds sont sécurisés dans le contrat escrow."
      : "En attente du dépôt des fonds par l'acheteur.";
  };

  const canBeCancelled = transaction.can_be_cancelled && !transaction.cancelled_at && 
                        !transaction.released_at && !transaction.buyer_confirmation;

  return (
    <div className="space-y-4">
      <Alert className={getStatusColor()}>
        <AlertDescription>
          {getStatusMessage()}
        </AlertDescription>
      </Alert>

      {canBeCancelled && isUserBuyer && (
        <Button 
          variant="destructive" 
          onClick={onCancelTransaction}
          disabled={isCancelling}
          className="w-full"
        >
          {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Annuler la transaction
        </Button>
      )}

      {!transaction.buyer_confirmation && transaction.funds_secured && !transaction.cancelled_at && (
        <EscrowStatus
          transactionId={transaction.id}
          buyerId={transaction.buyer_id}
          sellerId={transaction.seller_id}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
