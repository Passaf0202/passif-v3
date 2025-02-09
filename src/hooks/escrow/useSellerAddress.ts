
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSellerAddress = (transactionId: string) => {
  const [sellerAddress, setSellerAddress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSellerAddress = async () => {
      try {
        // D'abord, essayer de récupérer l'adresse depuis la transaction
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .select(`
            seller_wallet_address,
            listing_id,
            listings (
              wallet_address,
              user:profiles!listings_user_id_fkey (
                wallet_address
              )
            )
          `)
          .eq('id', transactionId)
          .single();

        if (transactionError) throw transactionError;

        if (!transaction) {
          console.error('No transaction found');
          return;
        }

        // Utiliser l'adresse de la transaction en priorité
        let address = transaction.seller_wallet_address;

        // Si pas d'adresse dans la transaction, essayer de la récupérer depuis l'annonce
        if (!address && transaction.listings) {
          address = transaction.listings.wallet_address || transaction.listings.user?.wallet_address;
        }

        if (address) {
          console.log('Setting seller address:', address);
          setSellerAddress(address);
        } else {
          console.error('No seller address found in any location');
          toast({
            title: "Erreur",
            description: "Adresse du vendeur introuvable",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching seller address:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer l'adresse du vendeur",
          variant: "destructive",
        });
      }
    };

    if (transactionId) {
      fetchSellerAddress();
    }
  }, [transactionId, toast]);

  return sellerAddress;
};
