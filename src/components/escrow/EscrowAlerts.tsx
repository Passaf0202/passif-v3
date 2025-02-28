import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Check, Lock } from "lucide-react";

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

      {!fundsSecured && !isUserBuyer && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            En attente de la sécurisation des fonds par l'acheteur
          </AlertDescription>
        </Alert>
      )}

      {status === "pending" && hasConfirmed && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            En attente de la confirmation de{" "}
            {isUserBuyer ? "livraison par le vendeur" : "réception par l'acheteur"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}