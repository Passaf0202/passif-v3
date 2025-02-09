
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EscrowStatus } from "@/components/escrow/EscrowStatus";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function TransactionStatus() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("ID de transaction reçu:", id);

        if (!id) {
          console.error("Aucun ID de transaction fourni");
          setError("Aucun ID de transaction fourni");
          setLoading(false);
          return;
        }

        // Retirer les potentiels caractères ':' au début
        const cleanId = id.replace(/^:/, '');
        
        // Validate UUID format
        if (!UUID_REGEX.test(cleanId)) {
          console.error("ID de transaction invalide:", cleanId);
          setError("ID de transaction invalide");
          setLoading(false);
          return;
        }

        const { data: userTransactions, error: userError } = await supabase
          .from("transactions")
          .select(`
            *,
            listings (title),
            buyer:profiles!buyer_id (username, full_name),
            seller:profiles!seller_id (username, full_name)
          `)
          .eq("id", cleanId)
          .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`);

        console.log("Résultat de la requête:", { data: userTransactions, error: userError });

        if (userError) {
          console.error("Erreur lors de la récupération de la transaction:", userError);
          setError("Erreur lors de la récupération de la transaction");
          return;
        }

        if (!userTransactions || userTransactions.length === 0) {
          console.error("Transaction non trouvée ou accès non autorisé");
          setError("Transaction non trouvée ou accès non autorisé");
          return;
        }

        console.log("Transaction trouvée:", userTransactions[0]);
        setTransaction(userTransactions[0]);
      } catch (err) {
        console.error("Erreur inattendue:", err);
        setError("Une erreur inattendue s'est produite");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransaction();
    }

    // Subscribe to changes
    const subscription = supabase
      .channel(`transaction-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log("Transaction mise à jour:", payload);
          setTransaction((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id, user?.id]);

  if (!user) {
    return (
      <div className="container max-w-2xl py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Veuillez vous connecter pour voir les détails de la transaction.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-2xl py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container max-w-2xl py-8">
        <Alert>
          <AlertDescription>Transaction non trouvée</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isUserBuyer = user?.id === transaction.buyer_id;
  const userRole = isUserBuyer ? "acheteur" : "vendeur";
  const otherParty = isUserBuyer ? transaction.seller : transaction.buyer;

  return (
    <div className="container max-w-2xl py-8 space-y-6">
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
              <p>Vous ({userRole}): {user.email}</p>
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
            </div>
          </div>

          <Alert className={transaction.escrow_status === 'completed' ? "bg-green-50" : "bg-blue-50"}>
            <AlertDescription>
              {transaction.escrow_status === 'completed' 
                ? "La transaction a été complétée avec succès. Les fonds ont été libérés au vendeur."
                : transaction.funds_secured
                  ? "Les fonds sont sécurisés dans le contrat escrow."
                  : "En attente du dépôt des fonds par l'acheteur."}
            </AlertDescription>
          </Alert>

          {!transaction.buyer_confirmation && transaction.funds_secured && (
            <EscrowStatus
              transactionId={transaction.id}
              buyerId={transaction.buyer_id}
              sellerId={transaction.seller_id}
              currentUserId={user.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
