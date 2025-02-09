
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { EscrowDetails } from "@/components/escrow/EscrowDetails";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ReleaseFunds() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkTransaction = async () => {
      if (!id) {
        setError("ID de transaction manquant");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Vérification de la transaction:", id);
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .select(`
            *,
            listings (
              title,
              crypto_amount,
              crypto_currency,
              wallet_address
            ),
            buyer:buyer_id (
              id,
              full_name
            ),
            seller:seller_id (
              id,
              full_name
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (transactionError) {
          console.error("Erreur lors de la récupération de la transaction:", transactionError);
          setError("Impossible de récupérer les détails de la transaction");
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les détails de la transaction",
            variant: "destructive",
          });
        } else if (!transaction) {
          console.log("Aucune transaction trouvée pour l'ID:", id);
          setError("Transaction introuvable");
          toast({
            title: "Erreur",
            description: "Transaction introuvable",
            variant: "destructive",
          });
        } else {
          console.log("Transaction trouvée:", transaction);
          setError(null);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la transaction:", error);
        setError("Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    checkTransaction();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-8">
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-8">
        <EscrowDetails transactionId={id || ''} />
      </div>
    </div>
  );
}
