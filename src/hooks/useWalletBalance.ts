import { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { supabase } from "@/integrations/supabase/client";
import { useCurrencyStore } from "@/stores/currencyStore";

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
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedCurrency } = useCurrencyStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const { data: wagmiBalance } = useBalance({
    address: address,
    watch: true,
  });

  useEffect(() => {
    if (wagmiBalance) {
      const amount = parseFloat(wagmiBalance.formatted);
      let convertedAmount = amount;

      // Conversion basée sur la devise sélectionnée (taux de conversion simplifiés)
      switch (selectedCurrency) {
        case 'USD':
          convertedAmount = amount * 1.1; // Taux EUR to USD
          break;
        case 'GBP':
          convertedAmount = amount * 0.85; // Taux EUR to GBP
          break;
        default: // EUR
          break;
      }

      setNativeBalance(`${convertedAmount.toFixed(4)} ${wagmiBalance.symbol}`);
    }
  }, [wagmiBalance, selectedCurrency]);

  const fetchBalance = async (walletAddress: string) => {
    const cachedData = balanceCache.get(walletAddress);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      console.log('Using cached balance data');
      return cachedData.balance;
    }

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

      let convertedValue = data.total_value_usd;
      
      // Conversion basée sur la devise sélectionnée
      switch (selectedCurrency) {
        case 'EUR':
          convertedValue = data.total_value_usd * 0.91; // USD to EUR
          break;
        case 'GBP':
          convertedValue = data.total_value_usd * 0.77; // USD to GBP
          break;
        default: // USD
          break;
      }
      
      const formattedBalance = new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(convertedValue);

      balanceCache.set(walletAddress, {
        balance: formattedBalance,
        timestamp: now
      });

      return formattedBalance;
    } catch (err) {
      if (err instanceof Error) {
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

    updateBalance();
    pollingIntervalRef.current = setInterval(updateBalance, POLLING_INTERVAL);

    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isConnected, address, selectedCurrency]);

  return { usdBalance, nativeBalance, isLoading, error };
};