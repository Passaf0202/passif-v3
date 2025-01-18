import { createConfig, configureChains, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { infuraProvider } from 'wagmi/providers/infura'

// Votre Project ID WalletConnect
export const projectId = '3225e25c4d47b78232829662814a3d58'

// Configuration des chaînes supportées
const chains = [mainnet]

const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [
    w3mProvider({ projectId }),
    publicProvider(),
  ]
)

// Configuration Wagmi
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ 
    chains,
    projectId,
    version: 2 // Spécifier la version 2 de WalletConnect
  }),
  publicClient,
  webSocketPublicClient
})

// Client Ethereum pour Web3Modal
export const ethereumClient = new EthereumClient(wagmiConfig, chains)