import { createConfig, configureChains } from 'wagmi';
import { amoy } from './chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';

export const projectId = '3225e25c4d47b78232829662814a3d58';

// Configuration des chaînes avec Amoy
const { publicClient, webSocketPublicClient } = configureChains(
  [amoy],
  [
    w3mProvider({ projectId }),
    publicProvider()
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ 
    projectId,
    chains: [amoy],
  }),
  publicClient,
  webSocketPublicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, [amoy]);