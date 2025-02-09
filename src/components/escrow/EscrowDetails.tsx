
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EscrowStatus } from "./EscrowStatus";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, listings(*)")
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Error fetching transaction:", error);
        return;
      }

      console.log("Transaction data:", data);
      setTransaction(data);
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
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId]);

  if (!transaction || !user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <EscrowStatus
        transactionId={transaction.id}
        buyerId={transaction.buyer_id}
        sellerId={transaction.seller_id}
        currentUserId={user.id}
        sellerWalletAddress={transaction.seller_wallet_address}
        amount={transaction.amount}
        cryptoAmount={transaction.amount}
        cryptoCurrency={transaction.token_symbol}
        title={transaction.listings.title}
      />
    </div>
  );
}
