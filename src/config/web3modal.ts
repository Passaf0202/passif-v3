import { createConfig, configureChains, mainnet, sepolia } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const projectId = '3225e25c4d47b78232829662814a3d58'

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

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
})

// Define networks in AppKit format
const appKitNetworks = [
  {
    id: 1,
    name: 'Ethereum',
    network: 'ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: {
      default: { http: ['https://cloudflare-eth.com'] },
      public: { http: ['https://cloudflare-eth.com'] }
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://etherscan.io'
      }
    }
  },
  {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18
    },
    rpcUrls: {
      default: { http: ['https://rpc.sepolia.org'] },
      public: { http: ['https://rpc.sepolia.org'] }
    },
    blockExplorers: {
      default: {
        name: 'Sepolia Etherscan',
        url: 'https://sepolia.etherscan.io'
      }
    }
  }
] as [AppKitNetwork, ...AppKitNetwork[]]

const appKit = createAppKit({
  projectId,
  metadata,
  networks: appKitNetworks,
  adapters: [new WagmiAdapter({ wagmiConfig })]
})

export { wagmiConfig, appKit }