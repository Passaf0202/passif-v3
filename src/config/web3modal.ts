import { createConfig, configureChains } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'

export const projectId = '3225e25c4d47b78232829662814a3d58'

// Force BSC Testnet as the only supported chain
const chains = [bscTestnet]

const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [w3mProvider({ projectId })]
)

// Wagmi configuration with enforced chain
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ 
    projectId,
    chains,
  }),
  publicClient,
  webSocketPublicClient
})

// Ethereum client for Web3Modal with enforced chain
export const ethereumClient = new EthereumClient(wagmiConfig, chains)