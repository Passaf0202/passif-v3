
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { amoy } from './chains';

// Project ID from reown.com
const projectId = '3225e25c4d47b78232829662814a3d58';

// Metadata configuration
const metadata = {
  name: 'AnnonceoSwap',
  description: 'Connectez votre wallet pour commencer',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Configure networks
const networks = [amoy];

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

// Create AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [amoy],
  projectId,
  metadata,
  features: {
    analytics: true
  }
});

// Export the adapter for provider setup
export const adapter = wagmiAdapter;

// Export the walletkit for components
export const walletkit = appKit;
