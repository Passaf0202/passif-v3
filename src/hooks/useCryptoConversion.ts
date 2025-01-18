import { useCryptoRates } from "./useCryptoRates";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCryptoConversion = (price: number, cryptoCurrency?: string) => {
  const { data: cryptoRates } = useCryptoRates();
  const { selectedCurrency } = useCurrencyStore();

  // Fetch real-time rate from Zerion
  const { data: zerionRate } = useQuery({
    queryKey: ['zerion-rate', cryptoCurrency],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY || '',
          },
          body: JSON.stringify({
            ids: 'binancecoin',
            vs_currencies: 'eur'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch rate from CoinGecko');
        }

        const data = await response.json();
        const eurRate = data.binancecoin.eur;
        console.log('Real-time BNB/EUR rate:', eurRate);
        return eurRate;
      } catch (error) {
        console.error('Error fetching CoinGecko rate:', error);
        // Fallback to fixed rate if API fails
        return 703.46; // Current BNB rate in EUR
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const calculateCryptoAmount = () => {
    if (!price) {
      console.log('No price provided');
      return null;
    }

    // Si une crypto est spécifiée dans l'annonce, l'utiliser, sinon BNB par défaut
    const targetCrypto = cryptoCurrency || 'BNB';
    
    // Utiliser le taux Zerion/CoinGecko si disponible
    if (zerionRate) {
      const cryptoAmount = price / zerionRate;
      console.log(`Calculated ${targetCrypto} amount using real-time rate:`, {
        price,
        rate: zerionRate,
        amount: cryptoAmount
      });
      
      return {
        amount: cryptoAmount,
        currency: targetCrypto
      };
    }

    // Fallback sur les taux de la base de données si l'API n'est pas disponible
    if (cryptoRates && Array.isArray(cryptoRates)) {
      const rate = cryptoRates.find(r => r.symbol === targetCrypto);
      
      if (!rate) {
        console.log(`${targetCrypto} rate not found in:`, cryptoRates);
        return null;
      }

      let priceInEur = price;
      switch (selectedCurrency) {
        case 'USD':
          priceInEur = price / rate.rate_usd * rate.rate_eur;
          break;
        case 'GBP':
          priceInEur = price / rate.rate_gbp * rate.rate_eur;
          break;
      }

      const cryptoAmount = priceInEur / rate.rate_eur;
      console.log(`Calculated ${targetCrypto} amount using DB rate:`, {
        price: priceInEur,
        rate: rate.rate_eur,
        amount: cryptoAmount
      });
      
      return {
        amount: cryptoAmount,
        currency: targetCrypto
      };
    }

    console.log('No rates available for conversion');
    return null;
  };

  return calculateCryptoAmount();
};