import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
        
        console.log('Rate response:', { rate, currency: cryptoCurrency });
        return rate;
      } catch (error) {
        console.error('Error in rate query:', error);
        // Utiliser les taux de repli en cas d'erreur
        return getFallbackRate(cryptoCurrency);
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const calculateCryptoAmount = () => {
    if (!price || !rateData) {
      console.log('No price or rate available');
      return null;
    }

    const targetCrypto = cryptoCurrency || 'BNB';
    const cryptoAmount = price / rateData;

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

// Fonction helper pour obtenir l'ID CoinGecko
function getCoinGeckoId(currency?: string): string {
  const mapping: Record<string, string> = {
    'BNB': 'binancecoin',
    'ETH': 'ethereum',
    'BTC': 'bitcoin',
    'SOL': 'solana',
  };
  return mapping[currency || 'BNB'] || 'binancecoin';
}

// Taux de repli en cas d'erreur d'API
function getFallbackRate(currency?: string): number {
  const fallbackRates: Record<string, number> = {
    'BNB': 250, // 1 BNB = 250 EUR
    'ETH': 2500, // 1 ETH = 2500 EUR
    'BTC': 40000, // 1 BTC = 40000 EUR
    'SOL': 90, // 1 SOL = 90 EUR
  };
  return fallbackRates[currency || 'BNB'] || 250;
}