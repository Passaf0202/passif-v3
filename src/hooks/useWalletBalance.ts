import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const [usdBalance, setUsdBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEthPrice = async (): Promise<number> => {
    const endpoints = [
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
      "https://api.coinbase.com/v2/prices/ETH-USD/spot"
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) continue;
        
        const data = await response.json();
        
        // Parse response based on API format
        if (endpoint.includes('coingecko')) {
          return data.ethereum.usd;
        } else if (endpoint.includes('cryptocompare')) {
          return data.USD;
        } else if (endpoint.includes('coinbase')) {
          return parseFloat(data.data.amount);
        }
      } catch (err) {
        console.error(`Error fetching from ${endpoint}:`, err);
        continue;
      }
    }
    throw new Error("Could not fetch ETH price from any endpoint");
  };

  const fetchBalance = async () => {
    if (!window.ethereum || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get ETH balance
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balanceWei = await provider.getBalance(address);
      console.log("Balance in Wei:", balanceWei.toString());
      
      const balanceInEth = Number(ethers.utils.formatUnits(balanceWei, 18));
      console.log("Balance in ETH:", balanceInEth);

      // Get ETH price with fallback endpoints
      const ethPrice = await fetchEthPrice();
      console.log("ETH Price:", ethPrice);

      // Calculate USD value
      const balanceInUSD = balanceInEth * ethPrice;
      console.log("Raw USD balance:", balanceInUSD);

      // Format with 2 decimal places
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
      // Refresh every 15 seconds
      const interval = setInterval(fetchBalance, 15000);
      return () => clearInterval(interval);
    } else {
      setUsdBalance(null);
    }
  }, [isConnected, address]);

  return { usdBalance, isLoading, error };
};