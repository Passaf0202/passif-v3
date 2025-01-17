import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const [usdBalance, setUsdBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [lastSuccessfulBalance, setLastSuccessfulBalance] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!address) return;

    // Increase minimum time between requests to 2 minutes
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    if (timeSinceLastFetch < 120000) { // 2 minutes
      console.log("Skipping fetch - using cached balance");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setLastFetchTime(now);

      const response = await fetch(`https://api.debank.com/user/total_balance?addr=${address}`, {
        headers: {
          'Accept': 'application/json',
          'AccessKey': 'f6527a8a1d1d37d2c7ad3bc35f6b1a6f'
        }
      });

      if (response.status === 429) {
        console.log("Rate limit hit, using cached balance");
        // Use last successful balance instead of showing error
        if (lastSuccessfulBalance) {
          setUsdBalance(lastSuccessfulBalance);
          return;
        }
        throw new Error('Trop de requêtes - veuillez patienter');
      }

      if (!response.ok) {
        throw new Error('Impossible de récupérer le solde');
      }

      const data = await response.json();
      console.log("DeBank API response:", data);

      if (data && data.data && typeof data.data.total_usd_value === 'number') {
        const formattedBalance = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(data.data.total_usd_value);

        console.log("Formatted USD balance:", formattedBalance);
        setLastSuccessfulBalance(formattedBalance); // Cache successful response
        setUsdBalance(formattedBalance);
      } else {
        throw new Error('Format de réponse invalide');
      }

    } catch (err) {
      console.error("Error fetching balance:", err);
      // Only show error if we don't have a cached balance
      if (!lastSuccessfulBalance) {
        setError(err instanceof Error ? err.message : "Erreur lors de la récupération du solde");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
      // Refresh every 3 minutes instead of 1 minute
      const interval = setInterval(fetchBalance, 180000);
      return () => clearInterval(interval);
    } else {
      setUsdBalance(null);
      setLastSuccessfulBalance(null);
    }
  }, [isConnected, address]);

  return { usdBalance, isLoading, error };
};