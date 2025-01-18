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
      if (!isConnected || !address || !wagmiBalance) {
        setNativeBalance(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Utiliser le montant exact du wallet
        const amount = parseFloat(wagmiBalance.formatted);
        
        // Formater selon la devise sélectionnée
        const formattedBalance = formatCurrencyValue(amount, selectedCurrency);

        console.log('Balance update:', {
          rawAmount: amount,
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
  }, [isConnected, address, wagmiBalance, selectedCurrency]);

  return { nativeBalance, isLoading, error };
};