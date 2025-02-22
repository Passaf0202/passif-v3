
import { createConfig, http } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnect, injected } from 'wagmi/connectors';

// Project ID from WalletConnect Cloud
const projectId = '3225e25c4d47b78232829662814a3d58';

// Configure wagmi config
export const config = createConfig({
  connectors: [
    walletConnect({ 
      projectId,
      metadata: {
        name: 'AnnonceoSwap',
        description: 'Connectez votre wallet pour commencer',
        url: window.location.origin,
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      }
    }),
    injected()
  ]
});

// Create web3modal instance with minimal configuration
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': 'rgb(147, 51, 234)',
    '--w3m-border-radius-master': '0.75rem'
  }
});
