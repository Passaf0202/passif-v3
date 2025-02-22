
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { amoy } from './chains';
import { QueryClient } from '@tanstack/query-core';

// Project ID from WalletConnect Cloud
const projectId = '3225e25c4d47b78232829662814a3d58';

// Metadata configuration
const metadata = {
  name: 'AnnonceoSwap',
  description: 'Connectez votre wallet pour commencer',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Configure all chains you want to support
const chains = [amoy];

// Create wagmi config with required properties
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
});

// Create web3modal instance
createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: true,
  themeMode: 'light',
  defaultChain: amoy,
  tokens: {
    [amoy.id]: {
      address: '0x0000000000000000000000000000000000000000',
      image: 'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png'
    }
  }
});

export const adapter = {
  wagmiConfig
};
