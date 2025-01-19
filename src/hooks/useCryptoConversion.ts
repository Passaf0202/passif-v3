import { useQuery } from "@tanstack/react-query";
import { useCurrencyStore } from "@/stores/currencyStore";

export const useCryptoConversion = (price: number, cryptoCurrency?: string) => {
  const { selectedCurrency } = useCurrencyStore();

  const { data: rateData } = useQuery({
    queryKey: ['crypto-rate', cryptoCurrency, selectedCurrency],
    queryFn: async () => {
      try {
        console.log(`Fetching rate for ${cryptoCurrency} in ${selectedCurrency}`);
        
        // Utiliser CoinGecko pour obtenir les taux
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

    const targetCrypto = cryptoCurrency || 'BNB';
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
    'BNB': 'binancecoin',
    'ETH': 'ethereum',
    'BTC': 'bitcoin',
    'SOL': 'solana',
  };
  return mapping[currency || 'BNB'] || 'binancecoin';
}

function getFallbackRate(currency?: string): number {
  const fallbackRates: Record<string, number> = {
    'BNB': 250,
    'ETH': 2500,
    'BTC': 40000,
    'SOL': 90,
  };
  return fallbackRates[currency || 'BNB'] || 250;
}