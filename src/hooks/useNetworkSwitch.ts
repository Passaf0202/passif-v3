
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { amoy } from '@/config/chains';
import { useToast } from '@/components/ui/use-toast';

export const useNetworkSwitch = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { toast } = useToast();

  const ensureCorrectNetwork = async () => {
    if (chain?.id !== amoy.id) {
      if (!switchNetwork) {
        throw new Error("Impossible de changer de réseau automatiquement. Veuillez connecter votre portefeuille à Polygon Amoy.");
      }

      try {
        console.log('🔹 Switching to Polygon Amoy network...');
        await switchNetwork(amoy.id);
        // Attendre que le changement de réseau soit effectif
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('🟢 Successfully switched to Polygon Amoy');
        toast({
          title: "Réseau changé",
          description: "Vous êtes maintenant connecté à Polygon Amoy",
        });
      } catch (error) {
        console.error('🚨 Network switch error:', error);
        throw new Error("Erreur lors du changement de réseau. Veuillez vous connecter manuellement à Polygon Amoy.");
      }
    } else {
      console.log('🟢 Already on Polygon Amoy network');
    }
  };

  const isWrongNetwork = chain?.id !== amoy.id;

  return {
    isWrongNetwork,
    ensureCorrectNetwork
  };
};
