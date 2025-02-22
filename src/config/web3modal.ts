
import { createConfig, configureChains } from 'wagmi';
import { amoy } from './chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';

export const projectId = '3225e25c4d47b78232829662814a3d58';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [amoy],
  [w3mProvider({ projectId }), publicProvider()]
);

const connectors = w3mConnectors({ 
  projectId, 
  chains,
  optionalChains: chains
});

export const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
  webSocketPublicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
