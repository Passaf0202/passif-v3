import { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance } from 'wagmi';
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
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedCurrency } = useCurrencyStore();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: wagmiBalance } = useBalance({
    address: address,
    watch: true,
  });

  const formatBalance = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const convertBalance = (amount: number, fromCurrency: string, toCurrency: string): number => {
    const rates = {
      EUR: { USD: 1.1, GBP: 0.85, EUR: 1 },
      USD: { EUR: 0.91, GBP: 0.77, USD: 1 },
      GBP: { EUR: 1.18, USD: 1.30, GBP: 1 }
    };

    // Si la devise source est ETH, on considère que le montant est déjà en EUR
    if (fromCurrency === 'ETH') {
      return amount * rates['EUR'][toCurrency];
    }

    return amount * rates[fromCurrency][toCurrency];
  };

  useEffect(() => {
    const updateBalance = async () => {
      if (!isConnected || !address || !wagmiBalance) {
        setNativeBalance(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const amount = parseFloat(wagmiBalance.formatted);
        const convertedAmount = convertBalance(amount, 'ETH', selectedCurrency);
        const formattedBalance = formatBalance(convertedAmount, selectedCurrency);

        console.log('Updating balance:', {
          original: amount,
          converted: convertedAmount,
          formatted: formattedBalance,
          currency: selectedCurrency
        });

        setNativeBalance(formattedBalance);
      } catch (err) {
        console.error('Error updating balance:', err);
        setError('Erreur lors de la mise à jour du solde');
      } finally {
        setIsLoading(false);
      }
    };

    updateBalance();

    // Mettre en place le polling
    if (isConnected && address) {
      pollingIntervalRef.current = setInterval(updateBalance, POLLING_INTERVAL);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isConnected, address, wagmiBalance, selectedCurrency]);

  return { nativeBalance, isLoading, error };
};