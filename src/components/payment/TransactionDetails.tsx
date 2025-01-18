import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionDetailsProps {
  title: string;
  price: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
}

export function TransactionDetails({ title, price, cryptoAmount, cryptoCurrency }: TransactionDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement en {cryptoCurrency || 'crypto'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Détails de la transaction</h3>
          <p className="text-sm text-gray-500">Article : {title}</p>
          <p className="text-sm text-gray-500">Prix : {price} EUR</p>
          {cryptoAmount && cryptoCurrency && (
            <p className="text-sm text-gray-500">
              Montant en crypto : {cryptoAmount.toFixed(6)} {cryptoCurrency}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}