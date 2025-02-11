
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "../types/escrow";
import { useToast } from "@/components/ui/use-toast";

export const useEscrowDetailsTransaction = (transactionId: string) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  const fetchTransaction = async () => {
    setIsFetching(true);
    console.log("[useEscrowDetailsTransaction] Fetching transaction:", transactionId);

    try {
      // Vérifier d'abord que l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("[useEscrowDetailsTransaction] No active session");
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour voir les détails de la transaction",
          variant: "destructive",
        });
        return;
      }

      // Essayer d'abord de trouver la transaction par listing_id
      let { data: txn, error: listingError } = await supabase
        .from('transactions')
        .select(`
          *,
          listing:listings!transactions_listing_id_fkey (
            title
          ),
          buyer:profiles!transactions_buyer_id_fkey (
            id,
            full_name
          ),
          seller:profiles!transactions_seller_id_fkey (
            id,
            full_name
          )
        `)
        .eq('listing_id', transactionId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (listingError) {
        console.error("[useEscrowDetailsTransaction] Error fetching by listing_id:", listingError);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les détails de la transaction",
          variant: "destructive",
        });
        return;
      }

      // Si aucune transaction n'est trouvée par listing_id, essayer par id direct
      if (!txn) {
        console.log("[useEscrowDetailsTransaction] No transaction found with listing_id, trying transaction id");
        let { data: txnById, error } = await supabase
          .from('transactions')
          .select(`
            *,
            listing:listings!transactions_listing_id_fkey (
              title
            ),
            buyer:profiles!transactions_buyer_id_fkey (
              id,
              full_name
            ),
            seller:profiles!transactions_seller_id_fkey (
              id,
              full_name
            )
          `)
          .eq('id', transactionId)
          .maybeSingle();

        if (error) {
          console.error("[useEscrowDetailsTransaction] Error fetching by id:", error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les détails de la transaction",
            variant: "destructive",
          });
          return;
        }

        txn = txnById;
      }

      if (txn) {
        console.log("[useEscrowDetailsTransaction] Transaction found:", txn);
        const formattedTransaction: Transaction = {
          id: txn.id,
          amount: txn.amount,
          commission_amount: txn.commission_amount,
          blockchain_txn_id: txn.blockchain_txn_id,
          status: txn.status,
          escrow_status: txn.escrow_status,
          token_symbol: txn.token_symbol || '',
          can_be_cancelled: txn.can_be_cancelled,
          funds_secured: txn.funds_secured,
          buyer_confirmation: txn.buyer_confirmation,
          seller_confirmation: txn.seller_confirmation,
          seller_wallet_address: txn.seller_wallet_address,
          listing_title: txn.listing?.title || 'N/A',
          buyer: txn.buyer,
          seller: txn.seller
        };
        setTransaction(formattedTransaction);
      } else {
        toast({
          title: "Transaction non trouvée",
          description: "Aucune transaction correspondante n'a été trouvée",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[useEscrowDetailsTransaction] Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des détails de la transaction",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  return {
    transaction,
    isLoading,
    setIsLoading,
    isFetching,
    fetchTransaction
  };
};
