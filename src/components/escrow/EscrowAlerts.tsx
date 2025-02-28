
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
      <Alert className="bg-gray-50 border-gray-200">
        <Shield className="h-4 w-4 text-gray-600" />
        <AlertDescription className="text-gray-700">
          Cette transaction est sécurisée par notre système d'escrow. Les fonds
          seront libérés une fois que l'acheteur aura confirmé la
          transaction.
        </AlertDescription>
      </Alert>

      {!fundsSecured && (
        <Alert className="bg-blue-50 border-blue-200">
          <Lock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            En attente de la sécurisation des fonds par l'acheteur
          </AlertDescription>
        </Alert>
      )}

      {status === "pending" && hasConfirmed && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            En attente de la confirmation de{" "}
            {isUserBuyer ? "livraison par le vendeur" : "réception par l'acheteur"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
