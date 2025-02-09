
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { amoy } from '@/config/chains';

export const useNetworkSwitch = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const ensureCorrectNetwork = async () => {
    if (chain?.id !== amoy.id) {
      if (!switchNetwork) {
        throw new Error("Impossible de changer de réseau automatiquement");
      }
      await switchNetwork(amoy.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const isWrongNetwork = chain?.id !== amoy.id;

  return {
    isWrongNetwork,
    ensureCorrectNetwork
  };
};
