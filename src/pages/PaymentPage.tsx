
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function PaymentPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        if (!id) {
          throw new Error("ID de transaction manquant");
        }

        console.log("Fetching transaction details for ID:", id);

        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .select(`
            *,
            listings (
              title,
              crypto_amount,
              crypto_currency
            ),
            seller:profiles!transactions_seller_id_fkey (
              full_name,
              wallet_address
            )
          `)
          .eq('id', id)
          .maybeSingle();

        console.log("Transaction data:", transaction);
        console.log("Transaction error:", transactionError);

        if (transactionError) {
          console.error("Erreur Supabase:", transactionError);
          throw transactionError;
        }

        if (!transaction) {
          throw new Error("Transaction non trouvée");
        }

        if (transaction.released_at) {
          throw new Error("Les fonds ont déjà été libérés");
        }

        setTransactionDetails(transaction);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Erreur:", error);
        setError(error.message || "Une erreur est survenue");
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  const handleReleaseFunds = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté");

      console.log("Releasing funds for transaction:", id);

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          released_at: new Date().toISOString(),
          released_by: user.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: "Les fonds ont été libérés au vendeur",
      });

      // Recharger les détails de la transaction
      window.location.reload();
    } catch (error: any) {
      console.error("Erreur lors de la libération des fonds:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Chargement des données de la transaction...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Libération des fonds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {transactionDetails?.listings?.title && (
                <div>
                  <h3 className="font-medium">Article</h3>
                  <p className="text-sm text-muted-foreground">
                    {transactionDetails.listings.title}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium">Montant</h3>
                <p className="text-sm text-muted-foreground">
                  {transactionDetails?.amount} {transactionDetails?.token_symbol}
                </p>
              </div>

              {transactionDetails?.seller?.full_name && (
                <div>
                  <h3 className="font-medium">Vendeur</h3>
                  <p className="text-sm text-muted-foreground">
                    {transactionDetails.seller.full_name}
                  </p>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  En libérant les fonds, vous confirmez avoir reçu l'article en bon état.
                  Cette action est irréversible.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleReleaseFunds}
                disabled={isLoading || !transactionDetails}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Libération des fonds en cours...
                  </>
                ) : (
                  "Confirmer la réception et libérer les fonds"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
