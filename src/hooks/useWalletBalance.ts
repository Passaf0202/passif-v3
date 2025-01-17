import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const [usdBalance, setUsdBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTimeRef = useRef(0);
  const lastSuccessfulBalanceRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBalance = async () => {
    if (!address) return;

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    const COOLDOWN_PERIOD = 300000; // 5 minutes

    if (timeSinceLastFetch < COOLDOWN_PERIOD) {
      console.log("Using cached balance - cooling down API requests");
      if (lastSuccessfulBalanceRef.current) {
        setUsdBalance(lastSuccessfulBalanceRef.current);
      }
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);
      lastFetchTimeRef.current = now;

      const response = await fetch(`https://api.debank.com/user/total_balance?addr=${address}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'AccessKey': '2f230fc83f0c4f1e9d2c48a51cc44c16'
        },
        signal: abortControllerRef.current.signal
      });

      if (response.status === 429) {
        console.log("Rate limit hit, using cached balance");
        if (lastSuccessfulBalanceRef.current) {
          setUsdBalance(lastSuccessfulBalanceRef.current);
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
        lastSuccessfulBalanceRef.current = formattedBalance;
        setUsdBalance(formattedBalance);
      } else {
        throw new Error('Format de réponse invalide');
      }

    } catch (err) {
      console.error("Error fetching balance:", err);
      if (!abortControllerRef.current?.signal.aborted) {
        if (lastSuccessfulBalanceRef.current) {
          setUsdBalance(lastSuccessfulBalanceRef.current);
        } else {
          setError(err instanceof Error ? err.message : "Erreur lors de la récupération du solde");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 300000); // 5 minutes

      return () => {
        clearInterval(interval);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    } else {
      setUsdBalance(null);
      lastSuccessfulBalanceRef.current = null;
    }
  }, [isConnected, address]);

  return { usdBalance, isLoading, error };
};