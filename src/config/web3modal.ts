
import { createConfig, configureChains } from 'wagmi';
import { amoy } from './chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';

export const projectId = '3225e25c4d47b78232829662814a3d58';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [amoy],
  [
    w3mProvider({ projectId }),
    publicProvider()
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: false, // Désactivation de l'autoConnect pour éviter les problèmes
  connectors: w3mConnectors({ 
    projectId,
    chains
  }),
  publicClient,
  webSocketPublicClient,
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
