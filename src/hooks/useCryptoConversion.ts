
import { useQuery } from "@tanstack/react-query";
import { useCurrencyStore } from "@/stores/currencyStore";
import { supabase } from "@/integrations/supabase/client";
import type { CryptoRate } from "@/hooks/useCryptoRates";

export const useCryptoConversion = (price: number, listingId?: string, cryptoCurrency: string = 'BNB') => {
  const { selectedCurrency } = useCurrencyStore();

  const { data: rateData } = useQuery({
    queryKey: ['crypto-rate', cryptoCurrency, selectedCurrency],
    queryFn: async () => {
      try {
        console.log(`Fetching rate for ${cryptoCurrency} in ${selectedCurrency}`);
        
        const { data, error } = await supabase
          .from('crypto_rates')
          .select('*')
          .eq('symbol', cryptoCurrency)
          .eq('is_active', true)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching rate:', error);
          return getFallbackRate(cryptoCurrency);
        }

        const rate = data as CryptoRate;

        // Get the appropriate rate based on selected currency
        const conversionRate = selectedCurrency === 'EUR' 
          ? rate.rate_eur 
          : selectedCurrency === 'GBP' 
            ? rate.rate_gbp 
            : rate.rate_usd;
        
        if (!conversionRate || typeof conversionRate !== 'number' || conversionRate <= 0) {
          console.error('Invalid rate received:', conversionRate);
          return getFallbackRate(cryptoCurrency);
        }
        
        console.log('Rate response:', { rate: conversionRate, currency: cryptoCurrency });

        // Only update listing if we have a valid listing ID and price
        if (listingId && price && conversionRate) {
          const cryptoAmount = price / conversionRate;
          await updateListingCryptoAmount(listingId, cryptoAmount, cryptoCurrency);
        }

        return conversionRate;
      } catch (error) {
        console.error('Error in rate query:', error);
        return getFallbackRate(cryptoCurrency);
      }
    },
    refetchInterval: 10000,
  });

  const calculateCryptoAmount = () => {
    if (!price || typeof price !== 'number' || !rateData || typeof rateData !== 'number') {
      console.log('Invalid price or rate:', { price, rateData });
      return null;
    }

    const cryptoAmount = price / rateData;

    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
      console.error('Invalid crypto amount calculated:', cryptoAmount);
      return null;
    }

    console.log(`Calculated ${cryptoCurrency} amount:`, {
      price,
      rate: rateData,
      amount: cryptoAmount
    });
    
    return {
      amount: cryptoAmount,
      currency: cryptoCurrency
    };
  };

  return calculateCryptoAmount();
};

async function updateListingCryptoAmount(listingId: string, amount: number, currency: string) {
  try {
    // Verify we have a valid listing ID before attempting update
    if (!listingId || typeof listingId !== 'string' || listingId.length !== 36) {
      console.error('Invalid listing ID:', listingId);
      return;
    }

    // Update the listing with the crypto amount and currency
    const { error } = await supabase
      .from('listings')
      .update({
        crypto_amount: amount,
        crypto_currency: currency
      })
      .eq('id', listingId);

    if (error) {
      console.error('Error updating listing crypto amount:', error);
    }
  } catch (error) {
    console.error('Error in updateListingCryptoAmount:', error);
  }
}

function getFallbackRate(currency: string): number {
  const fallbackRates: Record<string, number> = {
    'BNB': 275, // EUR rate
    'USDT': 0.92, // EUR rate
    'USDC': 0.92, // EUR rate
    'MATIC': 0.92, // EUR rate
  };
  return fallbackRates[currency] || 1;
}
