
import { useCurrencyStore } from "@/stores/currencyStore";
import { supabase } from "@/integrations/supabase/client";

interface CryptoAmount {
  amount: number;
  currency: string;
}

export const useCryptoConversion = (price: number, listingId?: string): { amount: CryptoAmount | null, isLoading: boolean } => {
  const { selectedCurrency } = useCurrencyStore();

  const calculateCryptoAmount = async (): Promise<CryptoAmount | null> => {
    if (!price || typeof price !== 'number') {
      return null;
    }

    // Si nous avons un listingId, essayons d'abord de récupérer le montant crypto stocké
    if (listingId) {
      const { data: listing, error } = await supabase
        .from('listings')
        .select('crypto_amount, crypto_currency')
        .eq('id', listingId)
        .single();

      if (!error && listing?.crypto_amount) {
        return {
          amount: listing.crypto_amount,
          currency: listing.crypto_currency || 'POL'
        };
      }
    }

    // Sinon, calculons le montant en POL (à adapter selon vos besoins)
    const cryptoAmount = price;

    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
      console.error('Invalid crypto amount calculated:', cryptoAmount);
      return null;
    }

    return {
      amount: cryptoAmount,
      currency: 'POL'
    };
  };

  const result = calculateCryptoAmount();

  return {
    amount: result ? {
      amount: Number(result.amount),
      currency: result.currency
    } : null,
    isLoading: false
  };
};
