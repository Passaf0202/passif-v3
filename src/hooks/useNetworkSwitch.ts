
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { amoy } from '@/config/chains';
import { useToast } from '@/components/ui/use-toast';

export const useNetworkSwitch = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { toast } = useToast();

  const ensureCorrectNetwork = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      // Vérifier si nous sommes sur le bon réseau
      if (chain?.id !== amoy.id) {
        console.log('Switching to Polygon Amoy network...');
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        
        await switchNetwork(amoy.id);
        
        // Attendre que le changement de réseau soit effectif
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Vérifier que le changement a bien été effectué
        const provider = window.ethereum;
        const chainId = await provider.request({ method: 'eth_chainId' });
        
        if (parseInt(chainId, 16) !== amoy.id) {
          throw new Error("Le changement de réseau a échoué");
        }
      }

      console.log('Network check complete - on Polygon Amoy');
    } catch (error: any) {
      console.error('Network switch error:', error);
      toast({
        title: "Erreur de réseau",
        description: error.message || "Veuillez vous connecter au réseau Polygon Amoy",
        variant: "destructive",
      });
      throw error;
    }
  };

  const isWrongNetwork = chain?.id !== amoy.id;

  return {
    isWrongNetwork,
    ensureCorrectNetwork
  };
};
