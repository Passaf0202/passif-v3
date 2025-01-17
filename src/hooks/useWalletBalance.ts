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

    // Increase minimum time between requests to 5 minutes
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    if (timeSinceLastFetch < 300000) { // 5 minutes
      console.log("Using cached balance - cooling down API requests");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setLastFetchTime(now);

      const response = await fetch(`https://api.debank.com/user/total_balance?addr=${address}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'AccessKey': '2f230fc83f0c4f1e9d2c48a51cc44c16' // Using a dedicated API key
        }
      });

      if (response.status === 429) {
        console.log("Rate limit hit, using cached balance");
        if (lastSuccessfulBalance) {
          setUsdBalance(lastSuccessfulBalance);
          return;
        }
        throw new Error('Trop de requêtes - veuillez réessayer dans quelques minutes');
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
        setLastSuccessfulBalance(formattedBalance);
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
      // Refresh every 5 minutes
      const interval = setInterval(fetchBalance, 300000);
      return () => clearInterval(interval);
    } else {
      setUsdBalance(null);
      setLastSuccessfulBalance(null);
    }
  }, [isConnected, address]);

  return { usdBalance, isLoading, error };
};