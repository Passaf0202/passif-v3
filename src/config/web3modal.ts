import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { mainnet, sepolia } from 'wagmi/chains'

const projectId = 'YOUR_WALLET_CONNECT_PROJECT_ID'

const metadata = {
  name: 'Web3Modal Example',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', 
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, sepolia]
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({ wagmiConfig, projectId, chains })