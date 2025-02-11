
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEscrowDetailsTransaction } from "./hooks/useEscrowDetailsTransaction";
import { TransactionStatus } from "./TransactionStatus";
import { EscrowActions } from "./EscrowActions";
import { EscrowInformation } from "./EscrowInformation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
    console.log("Fetching transaction details for UUID:", transactionId);
    fetchTransaction();
  }, [transactionId, fetchTransaction]);

  let content;
  if (isFetching) {
    content = (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  } else if (!transaction) {
    content = (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Transaction introuvable. Veuillez vérifier l'identifiant de la transaction.
        </AlertDescription>
      </Alert>
    );
  } else {
    content = (
      <div className="space-y-6">
        <EscrowInformation transaction={transaction} />
        <TransactionStatus transaction={transaction} />
        <EscrowActions 
          transaction={transaction}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onRelease={fetchTransaction}
          transactionId={transactionId}
        />
      </div>
    );
  }

  // La structure de base est toujours rendue
  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la transaction</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
