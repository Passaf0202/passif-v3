
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { TransactionDetailsCard } from "@/components/transaction/TransactionDetailsCard";
import { TransactionStatusCard } from "@/components/transaction/TransactionStatusCard";
import { useBlockchainTransaction } from "@/hooks/useBlockchainTransaction";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function TransactionStatus() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isCancelling, handleCancelTransaction } = useBlockchainTransaction(id || '');

  const handleCancel = async () => {
    if (transaction && user) {
      const success = await handleCancelTransaction(transaction, user.id);
      if (success) {
        setTransaction(prev => ({
          ...prev,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user.id,
          status: "cancelled",
          escrow_status: "cancelled"
        }));
      }
    }
  };

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
        
        // Si c'est un UUID, chercher d'abord dans Supabase
        if (UUID_REGEX.test(cleanId)) {
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

          if (!userError && userTransactions && userTransactions.length > 0) {
            console.log("Transaction trouvée dans Supabase:", userTransactions[0]);
            setTransaction(userTransactions[0]);
            setLoading(false);
            return;
          }
        }

        // Si pas trouvé dans Supabase ou si l'ID n'est pas un UUID,
        // chercher dans la blockchain
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(
            "0xe35a0cebf608bff98bcf99093b02469eea2cb38c",
            ["function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)"],
            provider
          );

          try {
            const txNumber = parseInt(cleanId);
            if (!isNaN(txNumber)) {
              const blockchainTx = await contract.getTransaction(txNumber);
              console.log("Transaction trouvée dans la blockchain:", blockchainTx);

              const { data: dbTx, error: dbError } = await supabase
                .from("transactions")
                .select(`
                  *,
                  listings (title),
                  buyer:profiles!buyer_id (username, full_name),
                  seller:profiles!seller_id (username, full_name)
                `)
                .eq("blockchain_txn_id", txNumber.toString())
                .single();

              if (!dbError && dbTx) {
                console.log("Transaction correspondante trouvée dans Supabase:", dbTx);
                setTransaction(dbTx);
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error("Erreur lors de la recherche dans la blockchain:", error);
          }
        }

        setError("Transaction non trouvée ou accès non autorisé");
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
  const otherParty = isUserBuyer ? transaction.seller : transaction.buyer;

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <TransactionDetailsCard
        transaction={transaction}
        isUserBuyer={isUserBuyer}
        user={user}
        otherParty={otherParty}
      />
      <TransactionStatusCard
        transaction={transaction}
        isUserBuyer={isUserBuyer}
        user={user}
        isCancelling={isCancelling}
        onCancelTransaction={handleCancel}
      />
    </div>
  );
}
