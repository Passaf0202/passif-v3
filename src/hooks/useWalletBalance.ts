
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "wagmi";

export function useWalletBalance() {
  const { address } = useAccount();

  const { data: balance, isLoading, error } = useQuery({
    queryKey: ['wallet-balance', address],
    queryFn: async () => {
      if (!address) return null;

      const { data, error } = await supabase.functions.invoke('get-wallet-balance', {
        body: { address }
      });

      if (error) {
        console.error('Error fetching wallet balance:', error);
        throw error;
      }

      // Le taux est en USD, nous devons le convertir en EUR
      const usdValue = data.total_value_usd;
      console.log('USD value:', usdValue);

      // Conversion approximative USD -> EUR (à améliorer avec un taux réel)
      const eurValue = usdValue * 0.91;
      const formattedBalance = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(eurValue);

      console.log('Formatted balance:', formattedBalance);
      return formattedBalance;
    },
    enabled: !!address,
    refetchInterval: 15 * 60 * 1000, // Réduit à toutes les 15 minutes
    staleTime: 14 * 60 * 1000, // Données "fraîches" pendant 14 minutes
    gcTime: 30 * 60 * 1000, // Garbage collection après 30 minutes
  });

  return {
    nativeBalance: balance,
    isLoading,
    error
  };
}
