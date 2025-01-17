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
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBalance = useCallback(async (retryCount = 0) => {
    if (!address || !isMountedRef.current) return;

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    const COOLDOWN_PERIOD = 300000; // 5 minutes
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 10000; // 10 seconds

    // Use cached balance during cooldown period
    if (timeSinceLastFetch < COOLDOWN_PERIOD) {
      console.log("Using cached balance - cooling down API requests");
      if (lastSuccessfulBalanceRef.current) {
        setUsdBalance(lastSuccessfulBalanceRef.current);
      }
      return;
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
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

      if (!isMountedRef.current) return;

      // Handle rate limiting
      if (response.status === 429) {
        console.log("Rate limit hit, using cached balance");
        if (lastSuccessfulBalanceRef.current) {
          setUsdBalance(lastSuccessfulBalanceRef.current);
          return;
        }

        // Retry logic for rate limiting
        if (retryCount < MAX_RETRIES) {
          const retryDelay = RETRY_DELAY * (retryCount + 1);
          console.log(`Retrying in ${retryDelay/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              fetchBalance(retryCount + 1);
            }
          }, retryDelay);
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

        if (isMountedRef.current) {
          lastSuccessfulBalanceRef.current = formattedBalance;
          setUsdBalance(formattedBalance);
        }
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      if (isMountedRef.current && err instanceof Error && !abortControllerRef.current?.signal.aborted) {
        if (lastSuccessfulBalanceRef.current) {
          setUsdBalance(lastSuccessfulBalanceRef.current);
        } else {
          setError(err.message);
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
      fetchBalance();
      const interval = setInterval(fetchBalance, 300000); // 5 minutes

      return () => {
        isMountedRef.current = false;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        clearInterval(interval);
      };
    } else {
      setUsdBalance(null);
      lastSuccessfulBalanceRef.current = null;
    }
  }, [isConnected, address, fetchBalance]);

  return { usdBalance, isLoading, error };
};