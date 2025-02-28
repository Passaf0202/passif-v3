
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, Check, Lock, Ban } from "lucide-react";

interface EscrowAlertsProps {
  status: string;
  hasConfirmed: boolean;
  fundsSecured: boolean;
  isUserBuyer: boolean;
}

export function EscrowAlerts({
  status,
  hasConfirmed,
  fundsSecured,
  isUserBuyer
}: EscrowAlertsProps) {
  if (status === "completed") {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Transaction terminée</AlertTitle>
        <AlertDescription className="text-green-700">
          Cette transaction a été complétée avec succès. Les fonds ont été libérés.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === "cancelled") {
    return (
      <Alert className="bg-red-50 border-red-200">
        <Ban className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Transaction annulée</AlertTitle>
        <AlertDescription className="text-red-700">
          Cette transaction a été annulée. Les fonds ont été retournés à l'acheteur.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Transaction sécurisée</AlertTitle>
        <AlertDescription className="text-blue-700">
          Cette transaction est sécurisée par notre système d'escrow. Les fonds
          seront libérés une fois que l'acheteur aura confirmé la
          transaction.
        </AlertDescription>
      </Alert>

      {!fundsSecured && (
        <Alert className="bg-indigo-50 border-indigo-200">
          <Lock className="h-4 w-4 text-indigo-600" />
          <AlertTitle className="text-indigo-800">Dépôt des fonds</AlertTitle>
          <AlertDescription className="text-indigo-700">
            En attente de la sécurisation des fonds par l'acheteur.
          </AlertDescription>
        </Alert>
      )}

      {status === "pending" && hasConfirmed && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Confirmation en attente</AlertTitle>
          <AlertDescription className="text-amber-700">
            En attente de la confirmation de{" "}
            {isUserBuyer ? "livraison par le vendeur" : "réception par l'acheteur"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
