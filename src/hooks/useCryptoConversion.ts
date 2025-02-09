
import { useCurrencyStore } from "@/stores/currencyStore";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface CryptoAmount {
  amount: number;
  currency: string;
}

export const useCryptoConversion = (price: number, listingId?: string): { amount: CryptoAmount | null, isLoading: boolean } => {
  const { selectedCurrency } = useCurrencyStore();

  const { data: cryptoAmount, isLoading } = useQuery({
    queryKey: ['crypto-conversion', price, listingId],
    enabled: !!price || !!listingId, // Only run the query if we have a price or listingId
    queryFn: async () => {
      // Si nous avons un listingId, essayons d'abord de récupérer le montant crypto stocké
      if (listingId) {
        const { data: listing, error } = await supabase
          .from('listings')
          .select('crypto_amount, crypto_currency')
          .eq('id', listingId)
          .maybeSingle();

        if (!error && listing?.crypto_amount) {
          return {
            amount: Number(listing.crypto_amount),
            currency: listing.crypto_currency || 'POL'
          };
        }
      }

      // Si pas de listing ou pas de montant crypto stocké, utiliser le prix
      if (!price || typeof price !== 'number' || isNaN(price) || price <= 0) {
        console.error('Invalid price:', price);
        return null;
      }

      // Utiliser directement le prix comme montant en POL
      return {
        amount: price,
        currency: 'POL'
      };
    }
  });

  return {
    amount: cryptoAmount || null,
    isLoading
  };
};
