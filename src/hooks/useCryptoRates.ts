import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CryptoRate {
  symbol: string;
  name: string;
  rate_usd: number;
  rate_eur: number;
  rate_gbp: number;
}

export function useCryptoRates() {
  return useQuery({
    queryKey: ['crypto-rates'],
    queryFn: async () => {
      console.log('Fetching crypto rates...');
      const { data, error } = await supabase
        .from('crypto_rates')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching crypto rates:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        console.error('Invalid crypto rates data:', data);
        return [];
      }

      console.log('Crypto rates fetched:', data);
      return data as CryptoRate[];
    },
    refetchInterval: 60000, // Refresh every minute
  });
}