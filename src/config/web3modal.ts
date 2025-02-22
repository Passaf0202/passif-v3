
import { configureChains, createConfig } from 'wagmi';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { amoy } from './chains';

// Projet ID de WalletConnect
const projectId = '3225e25c4d47b78232829662814a3d58';

const chains = [amoy];

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
export { Web3Modal };
