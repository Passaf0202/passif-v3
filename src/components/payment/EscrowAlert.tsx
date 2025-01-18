import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface EscrowAlertProps {
  escrowError: {
    available: string;
    required: string;
    missing: string;
  };
  onPayWithEscrowFees: () => void;
}

export function EscrowAlert({ escrowError, onPayWithEscrowFees }: EscrowAlertProps) {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription className="space-y-4">
        <p>Le service d'escrow nécessite un rechargement. Vous pouvez :</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Attendre que le service soit rechargé (quelques heures)</li>
          <li>Payer les frais d'escrow vous-même (+{escrowError.missing} ETH)</li>
        </ul>
        <Button 
          variant="outline"
          onClick={onPayWithEscrowFees}
          className="w-full mt-2"
        >
          Payer avec les frais d'escrow
        </Button>
      </AlertDescription>
    </Alert>
  );
}