import { useToast } from "@/components/ui/use-toast";
import { ethers } from "ethers";

export function useNetworkManager() {
  const { toast } = useToast();

  const ensureCorrectNetwork = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé");
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      
      if (network.chainId !== 97) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x61' }], // 97 en hexadécimal
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x61',
                  chainName: 'BSC Testnet',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                  },
                  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                  blockExplorerUrls: ['https://testnet.bscscan.com']
                }]
              });
            } catch (addError) {
              throw new Error("Impossible d'ajouter le réseau BSC Testnet");
            }
          } else {
            throw new Error("Veuillez changer manuellement pour le réseau BSC Testnet");
          }
        }
      }

      // Vérifier à nouveau le réseau après le changement
      const updatedNetwork = await provider.getNetwork();
      if (updatedNetwork.chainId !== 97) {
        throw new Error("Le changement de réseau a échoué");
      }

      return provider;
    } catch (error: any) {
      console.error('Network error:', error);
      toast({
        title: "Erreur de réseau",
        description: error.message || "Une erreur est survenue avec le réseau",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { ensureCorrectNetwork };
}