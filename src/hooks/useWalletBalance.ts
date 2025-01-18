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

  const { data: wagmiBalance, isError: isBalanceError } = useBalance({
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
          
          // Convertir le montant en ETH en valeur numérique
          const ethAmount = parseFloat(wagmiBalance.formatted);
          console.log('ETH amount:', ethAmount);

          // Pour le moment, on utilise une conversion simple (1 ETH = 2000€ approximativement)
          // TODO: Implémenter une vraie API de taux de change
          let convertedAmount = ethAmount;
          if (selectedCurrency === 'EUR') {
            convertedAmount = ethAmount * 2000; // Conversion approximative ETH -> EUR
          } else if (selectedCurrency === 'USD') {
            convertedAmount = ethAmount * 2200; // Conversion approximative ETH -> USD
          }

          console.log('Converted amount:', convertedAmount, selectedCurrency);
          
          const formattedBalance = formatCurrencyValue(convertedAmount, selectedCurrency);
          console.log('Formatted balance:', formattedBalance);

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