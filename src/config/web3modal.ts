
import { createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { amoy } from './chains';

const { chains, publicClient } = configureChains(
  [amoy],
  [publicProvider()]
);

export const config = createConfig({
  autoConnect: true,
  publicClient,
});
