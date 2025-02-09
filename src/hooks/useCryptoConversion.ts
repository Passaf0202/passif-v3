
import { useCurrencyStore } from "@/stores/currencyStore";
import { supabase } from "@/integrations/supabase/client";

interface CryptoAmount {
  amount: number;
  currency: string;
}

const POL_RATE = 1.00; // Fixed rate for POL/USD

export const useCryptoConversion = (price: number, listingId?: string): { amount: CryptoAmount | null, isLoading: boolean } => {
  const { selectedCurrency } = useCurrencyStore();

  const calculateCryptoAmount = (): CryptoAmount | null => {
    if (!price || typeof price !== 'number') {
      return null;
    }

    const cryptoAmount = price / POL_RATE;

    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
      console.error('Invalid crypto amount calculated:', cryptoAmount);
      return null;
    }

    if (listingId && price) {
      updateListingCryptoAmount(listingId, cryptoAmount).catch(console.error);
    }

    return {
      amount: cryptoAmount,
      currency: 'POL'
    };
  };

  return {
    amount: calculateCryptoAmount(),
    isLoading: false
  };
};

async function updateListingCryptoAmount(listingId: string, amount: number) {
  try {
    if (!listingId || typeof listingId !== 'string' || listingId.length !== 36) {
      console.error('Invalid listing ID:', listingId);
      return;
    }

    const { error } = await supabase
      .from('listings')
      .update({
        crypto_amount: amount,
        crypto_currency: 'POL'
      })
      .eq('id', listingId);

    if (error) {
      console.error('Error updating listing crypto amount:', error);
    }
  } catch (error) {
    console.error('Error in updateListingCryptoAmount:', error);
  }
}
