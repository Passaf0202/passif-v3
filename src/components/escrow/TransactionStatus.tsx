
import { Transaction } from "./types/escrow";

interface TransactionStatusProps {
  status: string;
  transaction?: Transaction;
}

export function TransactionStatus({ status }: TransactionStatusProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">État</h3>
      <p className="text-sm text-muted-foreground">
        {status === 'pending' ? 'En attente' : 
         status === 'completed' ? 'Terminée' : 
         'En cours'}
      </p>
    </div>
  );
}
