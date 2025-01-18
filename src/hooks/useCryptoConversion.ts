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