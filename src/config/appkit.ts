
import { createConfig } from '@reown/appkit';
import { wagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { amoy } from './chains';

export const projectId = 'bafe9d23-ac9a-45ff-a764-7ca70d5a7a1a';

export const appkitConfig = createConfig({
  projectId,
  adapter: wagmiAdapter({
    chains: [amoy],
    options: {
      shimDisconnect: true,
      UNSTABLE_shimOnConnectSelectAccount: true,
    },
  }),
});

