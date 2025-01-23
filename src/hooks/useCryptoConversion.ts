import { useQuery } from "@tanstack/react-query";
import { useCurrencyStore } from "@/stores/currencyStore";

export const useCryptoConversion = (price: number, cryptoCurrency?: string) => {
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

    const targetCrypto = cryptoCurrency || 'MATIC';
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

function getCoinGeckoId(currency?: string): string {
  const mapping: Record<string, string> = {
    'MATIC': 'matic-network',
    'USDT': 'tether',
    'USDC': 'usd-coin',
  };
  return mapping[currency || 'MATIC'] || 'matic-network';
}

function getFallbackRate(currency?: string): number {
  const fallbackRates: Record<string, number> = {
    'MATIC': 1,
    'USDT': 1,
    'USDC': 1,
  };
  return fallbackRates[currency || 'MATIC'] || 1;
}