
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
    queryKey: ['crypto-conversion', listingId],
    enabled: !!listingId,
    queryFn: async () => {
      if (!listingId) {
        throw new Error("ListingId est requis");
      }

      console.log('Fetching crypto amount for listing:', listingId);
      
      const { data: listing, error } = await supabase
        .from('listings')
        .select('crypto_amount, crypto_currency')
        .eq('id', listingId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching listing:', error);
        throw error;
      }

      if (!listing?.crypto_amount) {
        console.log('No crypto amount found for listing:', listingId);
        return null;
      }

      console.log('Found crypto amount:', listing.crypto_amount, listing.crypto_currency);
      
      return {
        amount: Number(listing.crypto_amount),
        currency: listing.crypto_currency || 'POL'
      };
    },
    retry: false
  });

  return {
    amount: cryptoAmount,
    isLoading
  };
};
