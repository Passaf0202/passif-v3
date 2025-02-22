
import { WalletKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { amoy } from './chains';

export const walletkit = new WalletKit({
  projectId: '3225e25c4d47b78232829662814a3d58',
  chains: [amoy],
  metadata: {
    name: 'AnnonceoSwap',
    description: 'Connectez votre wallet pour commencer',
    url: window.location.origin,
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  adapter: new WagmiAdapter({
    wagmiConfig: {
      chains: [amoy],
      projectId: '3225e25c4d47b78232829662814a3d58'
    }
  }),
});
