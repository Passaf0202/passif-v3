
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EscrowLoadingButton } from "./EscrowLoadingButton";
import { useFundsRelease } from "../../hooks/escrow/useFundsRelease";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EscrowStatusProps {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  currentUserId: string;
  sellerWalletAddress?: string;
  amount: number;
  cryptoAmount: number;
  cryptoCurrency: string;
  title: string;
}

export function EscrowStatus({
  transactionId,
  buyerId,
  sellerId,
  currentUserId,
  sellerWalletAddress,
  amount,
  cryptoAmount,
  cryptoCurrency,
  title
}: EscrowStatusProps) {
  const isUserBuyer = currentUserId === buyerId;
  const { isLoading, handleReleaseFunds } = useFundsRelease(transactionId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Article</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Montant</h3>
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">
              {amount} €
            </p>
            <p className="text-sm text-primary">
              ≈ {cryptoAmount.toFixed(6)} {cryptoCurrency}
            </p>
          </div>
        </div>

        {isUserBuyer ? (
          <EscrowLoadingButton
            isLoading={isLoading}
            onClick={handleReleaseFunds}
          />
        ) : (
          <Alert>
            <AlertDescription>
              En tant que vendeur, vous recevrez les fonds une fois que l'acheteur les aura libérés.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

