import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useCurrencyStore } from "@/stores/currencyStore";
import { formatCurrencyValue } from "@/utils/currencyUtils";
import { supabase } from "@/integrations/supabase/client";

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedCurrency } = useCurrencyStore();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !address) {
        setNativeBalance(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching balance for address:', address);
        
        const { data: response, error: functionError } = await supabase.functions.invoke(
          'get-wallet-balance',
          {
            body: { address },
          }
        );

        if (functionError) {
          console.error('Edge function error:', functionError);
          throw new Error(functionError.message);
        }

        console.log('Zerion API response:', response);

        if (response?.total_value_usd) {
          const usdValue = parseFloat(response.total_value_usd);
          console.log('USD value:', usdValue);

          let convertedAmount = usdValue;
          if (selectedCurrency === 'EUR') {
            convertedAmount = usdValue * 0.91; // Taux de conversion USD vers EUR
            console.log('Converted to EUR:', convertedAmount);
          }

          const formattedBalance = formatCurrencyValue(convertedAmount, selectedCurrency);
          console.log('Final formatted balance:', formattedBalance);
          setNativeBalance(formattedBalance);
        } else {
          console.log('No balance data available');
          setNativeBalance("0.00");
        }
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Erreur lors de la récupération du solde');
        setNativeBalance("0.00");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [isConnected, address, selectedCurrency]);

  return { nativeBalance, isLoading, error };
};