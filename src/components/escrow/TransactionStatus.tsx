
import { Transaction } from "./types/escrow";

interface TransactionStatusProps {
  transaction: Transaction;
}

export function TransactionStatus({ transaction }: TransactionStatusProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">État</h3>
      <p className="text-sm text-muted-foreground">
        {transaction?.escrow_status === 'pending' ? 'En attente' : 
         transaction?.escrow_status === 'completed' ? 'Terminée' : 
         'En cours'}
      </p>
    </div>
  );
}
