import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const [usdBalance, setUsdBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);

      // Utiliser l'API DeBank pour obtenir le solde total
      const response = await fetch(`https://api.debank.com/user/total_balance?addr=${address}`, {
        headers: {
          'Accept': 'application/json',
          'AccessKey': 'f6527a8a1d1d37d2c7ad3bc35f6b1a6f' // Clé d'API publique de DeBank
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance from DeBank');
      }

      const data = await response.json();
      console.log("DeBank API response:", data);

      if (data && data.data && typeof data.data.total_usd_value === 'number') {
        // Formater le solde avec 2 décimales
        const formattedBalance = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(data.data.total_usd_value);

        console.log("Formatted USD balance:", formattedBalance);
        setUsdBalance(formattedBalance);
      } else {
        throw new Error('Invalid response format from DeBank');
      }

    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Erreur lors de la récupération du solde");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
      // Rafraîchir toutes les 15 secondes
      const interval = setInterval(fetchBalance, 15000);
      return () => clearInterval(interval);
    } else {
      setUsdBalance(null);
    }
  }, [isConnected, address]);

  return { usdBalance, isLoading, error };
};