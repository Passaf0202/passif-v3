
import { configureChains, createConfig } from 'wagmi';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { amoy } from './chains';

// Projet ID de WalletConnect
export const projectId = '3225e25c4d47b78232829662814a3d58';

const chains = [amoy];

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Configuration de Web3Modal avec thème et métadonnées
const web3modalConfig = {
  projectId,
  ethereumClient,
  themeMode: 'light',
  themeVariables: {
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-accent-color': '#7C3AED', // Violet principal
    '--w3m-background-color': '#F9FAFB',
  },
  metadata: {
    name: 'AnnonceoSwap',
    description: 'Connectez votre wallet pour commencer',
    url: window.location.origin,
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  },
  defaultChain: amoy,
};

export const Web3ModalComponent = () => {
  return <Web3Modal {...web3modalConfig} />;
};
