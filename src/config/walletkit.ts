
import { createConfig, http } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnect, injected } from 'wagmi/connectors';
import { amoy } from './chains';
import { QueryClient } from '@tanstack/react-query';

// Project ID from WalletConnect Cloud
const projectId = '3225e25c4d47b78232829662814a3d58';

// Metadata configuration
const metadata = {
  name: 'AnnonceoSwap',
  description: 'Connectez votre wallet pour commencer',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Configure wagmi config
export const config = createConfig({
  chains: [amoy],
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected(),
  ],
  transports: {
    [amoy.id]: http(),
  },
  ssr: false,
});

// Create web3modal instance
createWeb3Modal({
  wagmiConfig: config,
  projectId,
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
