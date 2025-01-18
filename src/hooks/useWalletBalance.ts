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
          console.log('Balance data:', wagmiBalance);
          const ethAmount = parseFloat(wagmiBalance.formatted);
          
          // Conversion ETH vers la devise sélectionnée
          let convertedAmount = ethAmount;
          if (selectedCurrency === 'EUR') {
            convertedAmount = ethAmount * 2000; // Taux de conversion approximatif
          } else if (selectedCurrency === 'USD') {
            convertedAmount = ethAmount * 2200; // Taux de conversion approximatif
          }
          
          const formattedBalance = formatCurrencyValue(convertedAmount, selectedCurrency);
          setNativeBalance(formattedBalance);
        } else {
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