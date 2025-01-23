import { useQuery } from "@tanstack/react-query";
import { useCurrencyStore } from "@/stores/currencyStore";
import { supabase } from "@/integrations/supabase/client";

export const useCryptoConversion = (price: number, listingId?: string, cryptoCurrency: string = 'BNB') => {
  const { selectedCurrency } = useCurrencyStore();

  const { data: rateData } = useQuery({
    queryKey: ['crypto-rate', cryptoCurrency, selectedCurrency],
    queryFn: async () => {
      try {
        console.log(`Fetching rate for ${cryptoCurrency} in ${selectedCurrency}`);
        
        // Fetch rate from our database instead of external API
        const { data, error } = await supabase
          .from('crypto_rates')
          .select('*')
          .eq('symbol', cryptoCurrency)
          .eq('is_active', true)
          .single();
        
        if (error) {
          console.error('Error fetching rate:', error);
          return getFallbackRate(cryptoCurrency);
        }

        // Get the appropriate rate based on selected currency
        const rate = selectedCurrency === 'EUR' 
          ? data.rate_eur 
          : selectedCurrency === 'GBP' 
            ? data.rate_gbp 
            : data.rate_usd;
        
        if (!rate || typeof rate !== 'number' || rate <= 0) {
          console.error('Invalid rate received:', rate);
          return getFallbackRate(cryptoCurrency);
        }
        
        console.log('Rate response:', { rate, currency: cryptoCurrency });

        // Update listing with crypto amount if we have a listing ID
        if (listingId && price && rate) {
          const cryptoAmount = price / rate;
          await updateListingCryptoAmount(listingId, cryptoAmount, cryptoCurrency);
        }

        return rate;
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
  };
  return fallbackRates[currency] || 1;
}