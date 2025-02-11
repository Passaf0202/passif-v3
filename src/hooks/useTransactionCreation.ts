
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTransactionCreation = () => {
  const { toast } = useToast();

  const createTransaction = async (
    listingId: string,
    amount: number,
    cryptoCurrency: string,
    sellerAddress: string
  ) => {
    try {
      console.log("[useTransactionCreation] Creating transaction:", {
        listingId,
        amount,
        cryptoCurrency,
        sellerAddress
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour créer une transaction");
      }

      // Récupérer les détails de l'annonce
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            id,
            wallet_address
          )
        `)
        .eq('id', listingId)
        .single();

      if (listingError || !listing) {
        console.error("[useTransactionCreation] Error fetching listing:", listingError);
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      // Créer la transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: listing.user.id,
          amount: amount,
          commission_amount: amount * 0.05, // 5% commission
          status: 'pending',
          escrow_status: 'pending',
          network: 'polygon_amoy',
          token_symbol: cryptoCurrency,
          seller_wallet_address: sellerAddress,
          can_be_cancelled: true,
          chain_id: 80002 // Polygon Amoy testnet
        })
        .select()
        .single();

      if (transactionError) {
        console.error("[useTransactionCreation] Error creating transaction:", transactionError);
        throw new Error("Erreur lors de la création de la transaction");
      }

      console.log("[useTransactionCreation] Transaction created successfully:", transaction);
      return transaction;

    } catch (error: any) {
      console.error("[useTransactionCreation] Error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTransactionWithBlockchain = async (
    transactionId: string,
    blockchainTxnId: string,
    transactionHash: string
  ) => {
    try {
      console.log("[useTransactionCreation] Updating transaction with blockchain data:", {
        transactionId,
        blockchainTxnId,
        transactionHash
      });

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          blockchain_txn_id: blockchainTxnId,
          transaction_hash: transactionHash,
          funds_secured: true,
          funds_secured_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error("[useTransactionCreation] Error updating transaction:", updateError);
        throw new Error("Erreur lors de la mise à jour de la transaction");
      }

      console.log("[useTransactionCreation] Transaction updated successfully");

    } catch (error: any) {
      console.error("[useTransactionCreation] Error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    createTransaction,
    updateTransactionWithBlockchain
  };
};
