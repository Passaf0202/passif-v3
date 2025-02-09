
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
          console.error("ID manquant dans l'URL");
          throw new Error("ID de transaction manquant");
        }

        console.log("Tentative de récupération de la transaction avec ID:", id);

        // Vérifions d'abord si l'ID existe dans la table transactions
        const { data: transactionExists, error: existsError } = await supabase
          .from('transactions')
          .select('id')
          .eq('id', id)
          .maybeSingle();

        console.log("Vérification initiale de l'existence:", { transactionExists, existsError });

        if (existsError) {
          console.error("Erreur lors de la vérification initiale:", existsError);
          throw existsError;
        }

        if (!transactionExists) {
          console.error("Aucune transaction trouvée avec l'ID:", id);
          throw new Error("Transaction non trouvée dans la base de données");
        }

        // Si la transaction existe, récupérons tous les détails
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

        console.log("Détails complets de la transaction:", transaction);
        console.log("Erreur éventuelle:", transactionError);

        if (transactionError) {
          console.error("Erreur Supabase détaillée:", {
            message: transactionError.message,
            details: transactionError.details,
            hint: transactionError.hint
          });
          throw transactionError;
        }

        if (!transaction) {
          console.error("Détails de la transaction non trouvés");
          throw new Error("Impossible de récupérer les détails de la transaction");
        }

        if (transaction.released_at) {
          console.log("Les fonds ont déjà été libérés le:", transaction.released_at);
          throw new Error("Les fonds ont déjà été libérés");
        }

        setTransactionDetails(transaction);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Erreur complète:", error);
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

      console.log("Tentative de libération des fonds pour la transaction:", id);

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          released_at: new Date().toISOString(),
          released_by: user.id
        })
        .eq('id', id);

      if (updateError) {
        console.error("Erreur lors de la mise à jour:", updateError);
        throw updateError;
      }

      console.log("Fonds libérés avec succès");
      
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
