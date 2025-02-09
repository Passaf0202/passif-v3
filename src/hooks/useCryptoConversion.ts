
import { useQuery } from "@tanstack/react-query";
import { useCurrencyStore } from "@/stores/currencyStore";
import { supabase } from "@/integrations/supabase/client";

interface CryptoAmount {
  amount: number;
  currency: string;
}

const POL_RATES = {
  EUR: 0.92,
  USD: 1.00,
  GBP: 0.79
};

export const useCryptoConversion = (price: number, listingId?: string): { amount: CryptoAmount | null, isLoading: boolean } => {
  const { selectedCurrency } = useCurrencyStore();
  const { isLoading } = useQuery({
    queryKey: ['crypto-rate', selectedCurrency],
    queryFn: async () => {
      try {
        const rate = POL_RATES[selectedCurrency as keyof typeof POL_RATES];
        
        if (!rate) {
          console.error('Invalid currency:', selectedCurrency);
          return null;
        }

        const cryptoAmount = price / rate;
        
        if (listingId && price) {
          await updateListingCryptoAmount(listingId, cryptoAmount);
        }

        return rate;
      } catch (error) {
        console.error('Error in rate query:', error);
        return null;
      }
    },
    staleTime: 30000,
    retry: 2,
  });

  const calculateCryptoAmount = (): CryptoAmount | null => {
    const rate = POL_RATES[selectedCurrency as keyof typeof POL_RATES];
    
    if (!price || typeof price !== 'number' || !rate) {
      return null;
    }

    const cryptoAmount = price / rate;

    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
      console.error('Invalid crypto amount calculated:', cryptoAmount);
      return null;
    }

    return {
      amount: cryptoAmount,
      currency: 'POL'
    };
  };

  return {
    amount: calculateCryptoAmount(),
    isLoading
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
