
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EscrowStatus } from "./EscrowStatus";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, listings(*), buyer_confirmation")
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Error fetching transaction:", error);
        return;
      }

      setTransaction(data);
      setIsAlreadyConfirmed(data.buyer_confirmation);
    };

    fetchTransaction();

    // Subscribe to changes
    const subscription = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          console.log("Transaction updated:", payload);
          setTransaction(payload.new);
          setIsAlreadyConfirmed(payload.new.buyer_confirmation);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId]);

  if (!transaction || !user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Article</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.listings.title}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Montant</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.amount} {transaction.token_symbol}
          </p>
        </div>

        {!isAlreadyConfirmed && (
          <EscrowStatus
            transactionId={transaction.id}
            buyerId={transaction.buyer_id}
            sellerId={transaction.seller_id}
            currentUserId={user.id}
          />
        )}
      </CardContent>
    </Card>
  );
}
