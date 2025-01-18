import { useCryptoRates } from "./useCryptoRates";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCryptoConversion = (price: number, cryptoCurrency?: string) => {
  const { selectedCurrency } = useCurrencyStore();

  // Fetch real-time rate from database via Edge Function
  const { data: rate } = useQuery({
    queryKey: ['coinbase-rate', cryptoCurrency, selectedCurrency],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-coinbase-rate', {
          body: { 
            cryptoCurrency: cryptoCurrency || 'BNB',
            fiatCurrency: selectedCurrency
          }
        });

        if (error) {
          console.error('Error fetching rate:', error);
          return null;
        }

        console.log('Rate response:', data);
        return data.rate;
      } catch (error) {
        console.error('Error in rate query:', error);
        return null;
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const calculateCryptoAmount = () => {
    if (!price) {
      console.log('No price provided');
      return null;
    }

    const targetCrypto = cryptoCurrency || 'BNB';
    
    if (rate) {
      const cryptoAmount = price / rate;
      console.log(`Calculated ${targetCrypto} amount using rate:`, {
        price,
        rate,
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