import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useCurrencyStore } from "@/stores/currencyStore";
import { formatCurrencyValue } from "@/utils/currencyUtils";

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedCurrency } = useCurrencyStore();

  const { data: wagmiBalance } = useBalance({
    address: address,
    watch: true,
  });

  useEffect(() => {
    const updateBalance = async () => {
      if (!isConnected || !address) {
        setNativeBalance(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (wagmiBalance) {
          console.log('Raw balance data:', wagmiBalance);
          const ethAmount = parseFloat(wagmiBalance.formatted);
          console.log('ETH amount:', ethAmount);

          // Conversion avec des taux fixes comme avant
          let convertedAmount = ethAmount;
          if (selectedCurrency === 'EUR') {
            convertedAmount = ethAmount * 2000; // ~2000€ par ETH
            console.log('Converted to EUR:', convertedAmount);
          } else if (selectedCurrency === 'USD') {
            convertedAmount = ethAmount * 2200; // ~2200$ par ETH
            console.log('Converted to USD:', convertedAmount);
          }

          const formattedBalance = formatCurrencyValue(convertedAmount, selectedCurrency);
          console.log('Final formatted balance:', formattedBalance);
          setNativeBalance(formattedBalance);
        } else {
          console.log('No balance data available');
          setNativeBalance("0.00");
        }
      } catch (err) {
        console.error('Error updating balance:', err);
        setError('Erreur lors de la mise à jour du solde');
      } finally {
        setIsLoading(false);
      }
    };

    updateBalance();
  }, [isConnected, address, wagmiBalance, selectedCurrency]);

  return { nativeBalance, isLoading, error };
};