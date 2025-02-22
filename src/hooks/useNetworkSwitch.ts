
import { useSwitchChain, useChainId } from 'wagmi';
import { amoy } from '@/config/chains';

export const useNetworkSwitch = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const ensureCorrectNetwork = async () => {
    if (chainId !== amoy.id) {
      await switchChain({ chainId: amoy.id });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const isWrongNetwork = chainId !== amoy.id;

  return {
    isWrongNetwork,
    ensureCorrectNetwork
  };
};
