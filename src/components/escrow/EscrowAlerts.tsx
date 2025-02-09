
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EscrowAlertsProps {
  isUserBuyer: boolean;
}

export function EscrowAlerts({ isUserBuyer }: EscrowAlertsProps) {
  return (
    <Alert>
      <AlertDescription>
        {isUserBuyer
          ? "En tant qu'acheteur, vous pouvez confirmer la réception de l'article pour libérer les fonds."
          : "En tant que vendeur, vous recevrez les fonds une fois que l'acheteur aura confirmé la réception."}
      </AlertDescription>
    </Alert>
  );
}
