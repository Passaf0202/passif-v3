
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionDetailsCardProps {
  title?: string;
  amount: number;
  tokenSymbol: string;
  sellerAddress: string;
}

export function TransactionDetailsCard({
  title,
  amount,
  tokenSymbol,
  sellerAddress,
}: TransactionDetailsCardProps) {
  return (
    <>
      <div className="space-y-2">
        <h3 className="font-medium">Article</h3>
        <p className="text-sm text-muted-foreground">
          {title || "Titre non disponible"}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Montant</h3>
        <p className="text-sm text-muted-foreground">
          {amount} {tokenSymbol}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Adresse du vendeur</h3>
        <p className="text-sm text-muted-foreground">
          {sellerAddress || "Adresse non disponible"}
        </p>
      </div>
    </>
  );
}
