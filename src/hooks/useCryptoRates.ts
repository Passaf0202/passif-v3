
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CryptoRate {
  id: string;
  symbol: string;
  name: string;
  rate_usd: number;
  rate_eur: number;
  rate_gbp: number;
  last_updated?: string;
  is_active: boolean;
}

export function useCryptoRates() {
  return useQuery({
    queryKey: ['crypto-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_rates')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching crypto rates:', error);
        throw error;
      }

      console.log('Crypto rates fetched:', data);
      return data as CryptoRate[];
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
