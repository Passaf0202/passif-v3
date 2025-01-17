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
      
      // Récupérer le solde avec une précision maximale
      const balance = await provider.getBalance(address);
      console.log("Raw balance:", balance.toString());
      
      // Convertir le solde en ETH avec la précision appropriée
      const balanceInEth = ethers.utils.formatEther(balance);
      console.log("Balance in ETH (formatted):", balanceInEth);

      // Obtenir le prix ETH/USD depuis CoinGecko avec une précision maximale
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&precision=18"
      );
      const data = await response.json();
      const ethPrice = data.ethereum.usd;
      console.log("ETH Price from CoinGecko:", ethPrice);

      // Calculer la valeur USD avec une précision maximale
      const balanceInUSD = parseFloat(balanceInEth) * ethPrice;
      console.log("Calculated USD balance:", balanceInUSD);

      // Formater le résultat final avec 2 décimales
      setUsdBalance(balanceInUSD.toFixed(2));
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
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  return { usdBalance, isLoading, error };
};