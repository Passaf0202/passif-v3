import { createConfig, configureChains, mainnet, sepolia } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { Web3Modal } from '@web3modal/react'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const projectId = 'YOUR_WALLET_CONNECT_PROJECT_ID'

const metadata = {
  name: 'Web3Modal Example',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const { chains, publicClient } = configureChains(
  [mainnet, sepolia],
  [publicProvider()]
)

const connector = new WalletConnectConnector({
  chains,
  options: {
    projectId,
    metadata,
  },
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [connector],
  publicClient,
})

// Export the Web3Modal component instead of calling createWeb3Modal
export const web3ModalComponent = (
  <Web3Modal 
    projectId={projectId} 
    ethereumClient={publicClient}
  />
)