import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EscrowStatusProps {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  currentUserId: string;
}

export function EscrowStatus({ transactionId, buyerId, sellerId, currentUserId }: EscrowStatusProps) {
  const [status, setStatus] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const { toast } = useToast();

  const isUserBuyer = currentUserId === buyerId;

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("escrow_status, buyer_confirmation, seller_confirmation")
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Error fetching transaction status:", error);
        return;
      }

      setStatus(data.escrow_status);
      setHasConfirmed(
        isUserBuyer ? data.buyer_confirmation : data.seller_confirmation
      );
    };

    fetchTransactionStatus();

    // Souscrire aux changements de la transaction
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
          setStatus(payload.new.escrow_status);
          setHasConfirmed(
            isUserBuyer
              ? payload.new.buyer_confirmation
              : payload.new.seller_confirmation
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId, isUserBuyer]);

  const handleConfirmation = async () => {
    try {
      setIsLoading(true);

      // Appeler la fonction Edge pour gérer la confirmation
      const response = await fetch("/api/release-escrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          action: "confirm",
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm transaction");
      }

      toast({
        title: "Confirmation envoyée",
        description: "Votre confirmation a été enregistrée avec succès",
      });

      setHasConfirmed(true);
    } catch (error) {
      console.error("Error confirming transaction:", error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "completed") {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Transaction complétée avec succès
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Cette transaction est sécurisée par notre système d'escrow. Les fonds
          seront libérés une fois que l'acheteur et le vendeur auront confirmé la
          transaction.
        </AlertDescription>
      </Alert>

      {status === "pending" && !hasConfirmed && (
        <Button
          onClick={handleConfirmation}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmation en cours...
            </>
          ) : (
            `Confirmer la ${isUserBuyer ? "réception" : "livraison"}`
          )}
        </Button>
      )}

      {status === "pending" && hasConfirmed && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            En attente de la confirmation de{" "}
            {isUserBuyer ? "livraison par le vendeur" : "réception par l'acheteur"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}