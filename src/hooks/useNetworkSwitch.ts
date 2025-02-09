
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { polygonMumbai } from '@wagmi/core/chains';

export const useNetworkSwitch = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const ensureCorrectNetwork = async () => {
    if (chain?.id !== polygonMumbai.id) {
      if (!switchNetwork) {
        throw new Error("Impossible de changer de réseau automatiquement");
      }
      await switchNetwork(polygonMumbai.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const isWrongNetwork = chain?.id !== polygonMumbai.id;

  return {
    isWrongNetwork,
    ensureCorrectNetwork
  };
};
