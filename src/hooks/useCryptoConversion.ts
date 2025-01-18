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
      const { data, error } = await supabase.functions.invoke('get-wallet-balance', {
        body: { 
          address: '0x1234567890123456789012345678901234567890', // Une adresse de référence pour obtenir les taux
        }
      });

      if (error) {
        console.error('Error fetching Zerion rate:', error);
        throw error;
      }

      // Le taux est en USD, nous devons le convertir en EUR
      const usdValue = data.total_value_usd;
      console.log('USD value:', usdValue);

      // Conversion approximative USD -> EUR (à améliorer avec un taux réel)
      const eurValue = usdValue * 0.91;
      console.log('Formatted balance:', new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(eurValue));

      return eurValue;
    },
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  const calculateCryptoAmount = () => {
    if (!cryptoRates || !Array.isArray(cryptoRates)) {
      console.log('Invalid cryptoRates:', cryptoRates);
      return null;
    }

    // Si une crypto est spécifiée dans l'annonce, l'utiliser, sinon BNB par défaut
    const targetCrypto = cryptoCurrency || 'BNB';
    const rate = cryptoRates.find(r => r.symbol === targetCrypto);
    
    if (!rate) {
      console.log(`${targetCrypto} rate not found in:`, cryptoRates);
      return null;
    }

    console.log(`Using ${targetCrypto} rate:`, rate);

    let priceInEur = price;
    // Utiliser le taux Zerion si disponible
    if (zerionRate) {
      const cryptoAmount = price / zerionRate;
      console.log(`Calculated ${targetCrypto} amount:`, cryptoAmount, 'for price:', priceInEur, 'EUR');
      
      return {
        amount: cryptoAmount,
        currency: targetCrypto
      };
    }

    // Fallback sur les taux de CoinGecko si Zerion n'est pas disponible
    switch (selectedCurrency) {
      case 'USD':
        priceInEur = price / rate.rate_usd * rate.rate_eur;
        break;
      case 'GBP':
        priceInEur = price / rate.rate_gbp * rate.rate_eur;
        break;
    }

    const cryptoAmount = priceInEur / rate.rate_eur;
    console.log(`Calculated ${targetCrypto} amount:`, cryptoAmount, 'for price:', priceInEur, 'EUR');
    
    return {
      amount: cryptoAmount,
      currency: targetCrypto
    };
  };

  return calculateCryptoAmount();
};