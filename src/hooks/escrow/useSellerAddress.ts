
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSellerAddress = (transactionId: string) => {
  const [sellerAddress, setSellerAddress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSellerAddress = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            seller_wallet_address,
            listing:listings (
              user:profiles!listings_user_id_fkey (
                wallet_address
              )
            )
          `)
          .eq('id', transactionId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          console.error('No transaction found');
          return;
        }

        // Try to get seller address from the transaction first
        let address = data.seller_wallet_address;
        
        // If not found, try to get it from the listing's user profile
        if (!address && data.listing?.user?.wallet_address) {
          address = data.listing.user.wallet_address;
        }

        if (address) {
          console.log('Setting seller address:', address);
          setSellerAddress(address);
        } else {
          console.error('No seller address found');
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
