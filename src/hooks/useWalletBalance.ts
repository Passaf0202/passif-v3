import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const [usdBalance, setUsdBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTimeRef = useRef(0);
  const lastSuccessfulBalanceRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address || !isMountedRef.current) return;

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    const COOLDOWN_PERIOD = 300000; // 5 minutes

    // Use cached balance if within cooldown period
    if (timeSinceLastFetch < COOLDOWN_PERIOD && lastSuccessfulBalanceRef.current) {
      console.log("Using cached balance - cooling down API requests");
      setUsdBalance(lastSuccessfulBalanceRef.current);
      return;
    }

    // Cancel any ongoing request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);
      lastFetchTimeRef.current = now;

      const response = await fetch(
        `https://api.debank.com/user/total_balance?addr=${address}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'AccessKey': '2f230fc83f0c4f1e9d2c48a51cc44c16'
          },
          signal: abortControllerRef.current.signal
        }
      );

      if (!isMountedRef.current) return;

      if (response.status === 429) {
        console.log("Rate limit hit, using cached balance");
        if (lastSuccessfulBalanceRef.current) {
          setUsdBalance(lastSuccessfulBalanceRef.current);
        } else {
          setError('Trop de requêtes - veuillez réessayer dans quelques minutes');
        }
        return;
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

        if (isMountedRef.current) {
          lastSuccessfulBalanceRef.current = formattedBalance;
          setUsdBalance(formattedBalance);
        }
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      if (isMountedRef.current && err instanceof Error) {
        // Only set error if it's not an abort error
        if (err.name !== 'AbortError') {
          if (lastSuccessfulBalanceRef.current) {
            setUsdBalance(lastSuccessfulBalanceRef.current);
          } else {
            setError(err.message);
          }
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [address]);

  useEffect(() => {
    isMountedRef.current = true;

    if (isConnected && address) {
      // Initial fetch
      fetchBalance();

      // Set up polling with a longer interval (5 minutes)
      pollingIntervalRef.current = setInterval(fetchBalance, 300000);

      return () => {
        isMountedRef.current = false;
        
        // Clear polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        // Abort any in-flight request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      };
    } else {
      setUsdBalance(null);
      lastSuccessfulBalanceRef.current = null;
    }
  }, [isConnected, address, fetchBalance]);

  return { usdBalance, isLoading, error };
};