import { useQuery } from "@tanstack/react-query";
import { useCurrencyStore } from "@/stores/currencyStore";
import { supabase } from "@/integrations/supabase/client";

export const useCryptoConversion = (price: number, listingId?: string, cryptoCurrency?: string) => {
  const { selectedCurrency } = useCurrencyStore();

  const { data: rateData } = useQuery({
    queryKey: ['crypto-rate', cryptoCurrency, selectedCurrency],
    queryFn: async () => {
      try {
        console.log(`Fetching rate for ${cryptoCurrency} in ${selectedCurrency}`);
        
        // Use CoinGecko for rates
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${getCoinGeckoId(cryptoCurrency)}&vs_currencies=${selectedCurrency.toLowerCase()}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch rates from CoinGecko');
        }

        const data = await response.json();
        const rate = data[getCoinGeckoId(cryptoCurrency)][selectedCurrency.toLowerCase()];
        
        if (!rate || typeof rate !== 'number' || rate <= 0) {
          console.error('Invalid rate received:', rate);
          return getFallbackRate(cryptoCurrency);
        }
        
        console.log('Rate response:', { rate, currency: cryptoCurrency });

        // Si nous avons un listingId, mettons à jour l'annonce avec le montant en crypto
        if (listingId && price && rate) {
          const cryptoAmount = price / rate;
          await updateListingCryptoAmount(listingId, cryptoAmount, cryptoCurrency || 'USDT');
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

    const targetCrypto = cryptoCurrency || 'USDT';
    const cryptoAmount = price / rateData;

    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
      console.error('Invalid crypto amount calculated:', cryptoAmount);
      return null;
    }

    console.log(`Calculated ${targetCrypto} amount:`, {
      price,
      rate: rateData,
      amount: cryptoAmount
    });
    
    return {
      amount: cryptoAmount,
      currency: targetCrypto
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

function getCoinGeckoId(currency?: string): string {
  const mapping: Record<string, string> = {
    'MATIC': 'matic-network',
    'USDT': 'tether',
    'USDC': 'usd-coin',
  };
  return mapping[currency || 'USDT'] || 'tether';
}

function getFallbackRate(currency?: string): number {
  const fallbackRates: Record<string, number> = {
    'MATIC': 1,
    'USDT': 1,
    'USDC': 1,
  };
  return fallbackRates[currency || 'USDT'] || 1;
}