
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CompletedTransactionAlert() {
  return (
    <Alert>
      <AlertDescription>
        Les fonds ont été libérés au vendeur.
      </AlertDescription>
    </Alert>
  );
}
