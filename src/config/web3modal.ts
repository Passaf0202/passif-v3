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

// Convert chains to AppKit format with explicit typing
const appKitNetworks = [
  {
    id: mainnet.id,
    name: mainnet.name,
    network: mainnet.network,
    nativeCurrency: mainnet.nativeCurrency,
    rpcUrls: {
      default: { http: [mainnet.rpcUrls.default.http[0]] },
      public: { http: [mainnet.rpcUrls.public.http[0]] }
    },
    blockExplorers: {
      default: {
        name: mainnet.blockExplorers.default.name,
        url: mainnet.blockExplorers.default.url
      }
    }
  },
  {
    id: sepolia.id,
    name: sepolia.name,
    network: sepolia.network,
    nativeCurrency: sepolia.nativeCurrency,
    rpcUrls: {
      default: { http: [sepolia.rpcUrls.default.http[0]] },
      public: { http: [sepolia.rpcUrls.public.http[0]] }
    },
    blockExplorers: {
      default: {
        name: sepolia.blockExplorers.default.name,
        url: sepolia.blockExplorers.default.url
      }
    }
  }
]

const appKit = createAppKit({
  projectId,
  metadata,
  networks: appKitNetworks,
  adapters: [new WagmiAdapter({ wagmiConfig })]
})

export { wagmiConfig, appKit }