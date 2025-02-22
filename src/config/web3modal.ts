
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { amoy } from './chains';

// 1. Get projectId
export const projectId = '3225e25c4d47b78232829662814a3d58';

// 2. Create wagmiConfig
const metadata = {
  name: 'Tradecoiner',
  description: 'Trade with cryptocurrencies',
  url: 'https://tradecoiner.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [amoy];
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-font-family': 'Roboto, sans-serif',
    '--w3m-accent': '#000000',
    '--w3m-border-radius-master': '10px'
  }
});

