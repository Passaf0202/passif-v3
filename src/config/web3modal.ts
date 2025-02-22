
import { defaultWagmiConfig, createWeb3Modal } from '@web3modal/wagmi/react'
import { amoy } from './chains'

// Project ID from WalletConnect Cloud
export const projectId = '3225e25c4d47b78232829662814a3d58'

const metadata = {
  name: 'Reown',
  description: 'Reown Application',
  url: 'https://reown.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const wagmiConfigParameters = {
  chains: [amoy],
  projectId,
  metadata,
}

export const wagmiConfig = defaultWagmiConfig(wagmiConfigParameters)

// Initialize modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains: [amoy],
  defaultChain: amoy,
  themeMode: 'light'
})
