
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEscrowDetailsTransaction } from "./hooks/useEscrowDetailsTransaction";
import { TransactionStatus } from "./TransactionStatus";
import { EscrowActions } from "./EscrowActions";
import { EscrowInformation } from "./EscrowInformation";
import { CompletedTransactionDetails } from "./CompletedTransactionDetails";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const { 
    transaction, 
    isLoading, 
    setIsLoading, 
    isFetching, 
    fetchTransaction 
  } = useEscrowDetailsTransaction(transactionId);

  useEffect(() => {
    console.log("Fetching transaction details for:", transactionId);
    fetchTransaction();
  }, [transactionId]);

  const renderErrorMessage = () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUUID = uuidPattern.test(transactionId);

    if (isUUID) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La transaction est en cours de traitement. Si vous venez de la créer, 
            veuillez patienter quelques instants puis rafraîchir la page.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Transaction introuvable. Veuillez vérifier l'identifiant de la transaction.
        </AlertDescription>
      </Alert>
    );
  };

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!transaction) {
      return (
        <Card>
          <CardContent className="p-8">
            {renderErrorMessage()}
          </CardContent>
        </Card>
      );
    }

    // Si la transaction est complétée, afficher les détails de complétion
    if (transaction.escrow_status === 'completed') {
      return <CompletedTransactionDetails transaction={transaction} />;
    }

    // Sinon, afficher l'interface normale
    return (
      <CardContent className="space-y-6">
        <EscrowInformation transaction={transaction} />
        <TransactionStatus transaction={transaction} />
        <EscrowActions 
          transaction={transaction}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onRelease={fetchTransaction}
          transactionId={transactionId}
        />
      </CardContent>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la transaction</CardTitle>
      </CardHeader>
      {renderContent()}
    </Card>
  );
}
