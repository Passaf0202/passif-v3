import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const [usdBalance, setUsdBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!window.ethereum || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      // Utiliser ethers.js avec le provider Web3
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Récupérer le solde en wei (unité la plus petite)
      const balanceWei = await provider.getBalance(address);
      console.log("Balance in Wei:", balanceWei.toString());
      
      // Convertir le solde de Wei en ETH avec la précision maximale
      const balanceInEth = Number(ethers.utils.formatUnits(balanceWei, 18));
      console.log("Balance in ETH:", balanceInEth);

      // Obtenir le prix ETH/USD depuis CoinGecko avec une précision maximale
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&precision=18"
      );
      const data = await response.json();
      const ethPrice = Number(data.ethereum.usd);
      console.log("ETH Price from CoinGecko:", ethPrice);

      // Calculer la valeur USD avec une précision maximale en utilisant BigNumber
      const balanceInUSD = balanceInEth * ethPrice;
      console.log("Raw USD balance:", balanceInUSD);

      // Formater le résultat final avec 2 décimales et éviter les erreurs d'arrondi
      const formattedBalance = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(balanceInUSD);

      console.log("Formatted USD balance:", formattedBalance);
      setUsdBalance(formattedBalance);

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
      // Rafraîchir toutes les 15 secondes au lieu de 30 pour plus de réactivité
      const interval = setInterval(fetchBalance, 15000);
      return () => clearInterval(interval);
    } else {
      setUsdBalance(null);
    }
  }, [isConnected, address]);

  return { usdBalance, isLoading, error };
};