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
        
        // Récupérer le taux depuis la table crypto_rates
        const { data: rates, error } = await supabase
          .from('crypto_rates')
          .select('*')
          .eq('symbol', cryptoCurrency || 'BNB')
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        
        if (!rates) {
          console.log('Using fallback rate');
          return getFallbackRate(cryptoCurrency);
        }

        const rate = selectedCurrency === 'EUR' ? rates.rate_eur : 
                    selectedCurrency === 'GBP' ? rates.rate_gbp : 
                    rates.rate_usd;

        console.log('Rate response:', { rate, currency: cryptoCurrency });
        return rate;
      } catch (error) {
        console.error('Error in rate query:', error);
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
    // Diviser le prix en EUR par le taux pour obtenir le montant en crypto
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

function getFallbackRate(currency?: string): number {
  const fallbackRates: Record<string, number> = {
    'BNB': 250, // 1 BNB = 250 EUR
    'ETH': 2500, // 1 ETH = 2500 EUR
    'BTC': 40000, // 1 BTC = 40000 EUR
    'SOL': 90, // 1 SOL = 90 EUR
  };
  return fallbackRates[currency || 'BNB'] || 250;
}