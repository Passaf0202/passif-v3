import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrencyStore } from "@/stores/currencyStore";

interface TransactionDetailsProps {
  title: string;
  price: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
}

export function TransactionDetails({ 
  title, 
  price, 
  cryptoAmount, 
  cryptoCurrency 
}: TransactionDetailsProps) {
  const { selectedCurrency } = useCurrencyStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Article</h3>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Prix</h3>
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-gray-500">
              {price.toLocaleString(undefined, {
                style: 'currency',
                currency: selectedCurrency
              })}
            </p>
            {cryptoAmount && cryptoCurrency && (
              <p className="text-sm font-medium text-primary">
                ≈ {cryptoAmount.toFixed(6)} {cryptoCurrency}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">
            Le taux de conversion est mis à jour en temps réel. Le montant final en crypto peut varier légèrement au moment de la transaction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}