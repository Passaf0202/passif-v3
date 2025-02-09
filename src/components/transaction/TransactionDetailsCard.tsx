
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionDetailsCardProps {
  transaction: any;
  isUserBuyer: boolean;
  user: any;
  otherParty: any;
}

export function TransactionDetailsCard({
  transaction,
  isUserBuyer,
  user,
  otherParty,
}: TransactionDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut de la Transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Article</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.listings?.title}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Montant</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.amount} {transaction.token_symbol}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Participants</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Vous ({isUserBuyer ? "acheteur" : "vendeur"}): {user.email}</p>
            <p>{isUserBuyer ? "Vendeur" : "Acheteur"}: {otherParty?.full_name}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Dates</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Création: {format(new Date(transaction.created_at), "PPP 'à' p", { locale: fr })}</p>
            {transaction.funds_secured_at && (
              <p>Fonds sécurisés: {format(new Date(transaction.funds_secured_at), "PPP 'à' p", { locale: fr })}</p>
            )}
            {transaction.released_at && (
              <p>Fonds libérés: {format(new Date(transaction.released_at), "PPP 'à' p", { locale: fr })}</p>
            )}
            {transaction.cancelled_at && (
              <p>Transaction annulée: {format(new Date(transaction.cancelled_at), "PPP 'à' p", { locale: fr })}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
