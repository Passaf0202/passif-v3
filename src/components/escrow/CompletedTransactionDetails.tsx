
import { Transaction } from "./types/escrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface CompletedTransactionDetailsProps {
  transaction: Transaction;
}

export function CompletedTransactionDetails({ transaction }: CompletedTransactionDetailsProps) {
  const getExplorerUrl = () => {
    // Pour Polygon Mumbai/Amoy testnet
    return `https://mumbai.polygonscan.com/tx/${transaction.transaction_hash}`;
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="bg-green-100 rounded-full p-4">
          <Check className="h-8 w-8 text-green-600 animate-scale-in" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction complétée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Les fonds ont été libérés avec succès au vendeur
              </p>
              <p className="text-xs text-green-600 mt-1">
                {formatDate(transaction.updated_at || "")}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Montant transféré</p>
                <p className="text-lg font-semibold">
                  {transaction.amount} {transaction.token_symbol}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Commission</p>
                <p className="text-lg font-semibold">
                  {transaction.commission_amount} {transaction.token_symbol}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Adresse du vendeur</p>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {transaction.seller_wallet_address}
                </p>
              </div>

              {transaction.transaction_hash && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open(getExplorerUrl(), '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir sur l'explorateur
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
