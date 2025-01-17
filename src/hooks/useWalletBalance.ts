import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from "@/integrations/supabase/client";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const POLLING_INTERVAL = 30 * 1000; // 30 seconds

interface CacheEntry {
  balance: string;
  timestamp: number;
}

const balanceCache = new Map<string, CacheEntry>();

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const [usdBalance, setUsdBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchBalance = async (walletAddress: string) => {
    // Check cache first
    const cachedData = balanceCache.get(walletAddress);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      console.log('Using cached balance data');
      return cachedData.balance;
    }

    // Create new abort controller for this request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      console.log('Fetching balance for wallet:', walletAddress);
      
      const { data, error: functionError } = await supabase.functions.invoke('get-wallet-balance', {
        body: { address: walletAddress }
      });

      if (!isMountedRef.current) return null;

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message);
      }

      if (!data?.total_value_usd) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from API');
      }
      
      const formattedBalance = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(data.total_value_usd);

      // Update cache
      balanceCache.set(walletAddress, {
        balance: formattedBalance,
        timestamp: now
      });

      return formattedBalance;
    } catch (err) {
      if (err instanceof Error) {
        // Don't throw for abort errors
        if (err.name === 'AbortError') {
          console.log('Request aborted');
          return null;
        }
        throw err;
      }
      throw new Error('Unknown error occurred');
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    const updateBalance = async () => {
      if (!isConnected || !address || !isMountedRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        const balance = await fetchBalance(address);
        if (isMountedRef.current) {
          setUsdBalance(balance);
        }
      } catch (err) {
        console.error('Error fetching balance:', err);
        if (isMountedRef.current) {
          setError('Failed to fetch balance');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    updateBalance();

    // Set up polling with a longer interval
    pollingIntervalRef.current = setInterval(updateBalance, POLLING_INTERVAL);

    return () => {
      isMountedRef.current = false;
      
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Abort any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isConnected, address]);

  return { usdBalance, isLoading, error };
};