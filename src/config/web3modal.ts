import { createConfig, configureChains } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'

// Your WalletConnect Project ID
export const projectId = '3225e25c4d47b78232829662814a3d58'

// Supported chains configuration
const chains = [bscTestnet]

const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [w3mProvider({ projectId })]
)

// Wagmi configuration
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ 
    chains,
    projectId,
  }),
  publicClient,
  webSocketPublicClient
})

// Ethereum client for Web3Modal
export const ethereumClient = new EthereumClient(wagmiConfig, chains)