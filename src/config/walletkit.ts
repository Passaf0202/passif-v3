
import { createConfig, http } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnect, injected } from 'wagmi/connectors';
import { amoy } from './chains';
import { QueryClient } from '@tanstack/react-query';

// Project ID from WalletConnect Cloud
const projectId = '3225e25c4d47b78232829662814a3d58';

// Create a custom query client
const queryClient = new QueryClient();

// Configure wagmi config with all required properties
export const config = createConfig({
  chains: [amoy],
  connectors: [
    walletConnect({ projectId, showQrModal: false, metadata: {
      name: 'AnnonceoSwap',
      description: 'Connectez votre wallet pour commencer',
      url: window.location.origin,
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    }}),
    injected(),
  ],
  transports: {
    [amoy.id]: http(),
  },
  queryClient,
  syncConnectedChain: true,
  ssr: false,
  state: {
    chains: [amoy],
    connections: new Map(),
    current: undefined,
    status: "disconnected" as const,
  },
});

// Create web3modal instance
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  chains: [amoy],
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': 'rgb(147, 51, 234)',
    '--w3m-border-radius-master': '0.75rem'
  },
  defaultChain: amoy,
  tokens: {
    [amoy.id]: {
      address: '0x0000000000000000000000000000000000000000',
      image: 'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png'
    }
  }
});

export { queryClient };
