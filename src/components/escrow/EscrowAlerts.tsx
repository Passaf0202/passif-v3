
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Check, Lock } from "lucide-react";
import { Transaction } from "./types/escrow";

interface EscrowAlertsProps {
  transaction: Transaction;
  status?: string;
  hasConfirmed?: boolean;
  fundsSecured?: boolean;
  isUserBuyer?: boolean;
}

export function EscrowAlerts({
  transaction,
  status,
  hasConfirmed,
  fundsSecured,
  isUserBuyer
}: EscrowAlertsProps) {
  // Récupérer les valeurs depuis la transaction si non fournies en props
  const transactionStatus = status || transaction.escrow_status;
  const transactionHasConfirmed = hasConfirmed || transaction.buyer_confirmation;
  const transactionFundsSecured = fundsSecured !== undefined ? fundsSecured : transaction.funds_secured;
  const userIsBuyer = isUserBuyer !== undefined ? isUserBuyer : transaction.isUserBuyer;

  if (transactionStatus === "completed") {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Transaction complétée avec succès
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Cette transaction est sécurisée par notre système d'escrow. Les fonds
          seront libérés une fois que l'acheteur aura confirmé la
          transaction.
        </AlertDescription>
      </Alert>

      {!transactionFundsSecured && !userIsBuyer && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            En attente de la sécurisation des fonds par l'acheteur
          </AlertDescription>
        </Alert>
      )}

      {transactionStatus === "pending" && transactionHasConfirmed && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            En attente de la confirmation de{" "}
            {userIsBuyer ? "livraison par le vendeur" : "réception par l'acheteur"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
