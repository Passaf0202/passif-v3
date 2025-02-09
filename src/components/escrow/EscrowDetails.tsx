
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TransactionDetailsCard } from "./TransactionDetailsCard";
import { FundsReleaseSection } from "./FundsReleaseSection";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) {
        console.error('Transaction ID is missing');
        return;
      }

      console.log('Fetching transaction with ID:', transactionId);
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          listings(*),
          buyer_confirmation,
          seller_wallet_address,
          blockchain_txn_id
        `)
        .eq("id", transactionId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching transaction:", error);
        return;
      }

      console.log("Transaction data:", data);
      if (data) {
        setTransaction(data);
        setIsAlreadyConfirmed(data.buyer_confirmation);
      }
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

  const isBuyer = user.id === transaction.buyer_id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TransactionDetailsCard
          title={transaction.listings?.title}
          amount={transaction.amount}
          tokenSymbol={transaction.token_symbol}
          sellerAddress={transaction.seller_wallet_address}
        />

        {isBuyer && (
          <FundsReleaseSection
            transactionId={transactionId}
            blockchainTxnId={transaction.blockchain_txn_id}
            isConfirmed={isAlreadyConfirmed}
          />
        )}
      </CardContent>
    </Card>
  );
}
