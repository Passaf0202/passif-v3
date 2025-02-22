
import { createConfig, configureChains } from 'wagmi';
import { amoy } from './chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';

// Assurez-vous que ce projectId est valide sur le dashboard WalletConnect
export const projectId = '3225e25c4d47b78232829662814a3d58';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [amoy],
  [w3mProvider({ projectId }), publicProvider()],
  {
    batch: { multicall: true },
    retryCount: 3,
    pollingInterval: 5000,
  }
);

const connectors = w3mConnectors({ 
  version: 2,  // Spécifier la version 2 de WalletConnect
  projectId, 
  chains,
  metadata: {
    name: 'Mon Application',
    description: 'Application Web3',
    url: window.location.host,
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
