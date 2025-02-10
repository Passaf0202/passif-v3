
import { Transaction } from "./types/escrow";

interface EscrowInformationProps {
  transaction: Transaction;
}

export function EscrowInformation({ transaction }: EscrowInformationProps) {
  return (
    <>
      <div className="space-y-2">
        <h3 className="font-medium">Article</h3>
        <p className="text-sm text-muted-foreground">
          {transaction?.listing_title || "N/A"}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Montant</h3>
        <p className="text-sm text-muted-foreground">
          {transaction?.amount} {transaction?.token_symbol}
        </p>
      </div>
    </>
  );
}
