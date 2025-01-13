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

// Convert chains to AppKit format
const appKitNetworks = chains.map(chain => ({
  id: chain.id,
  name: chain.name,
  network: chain.network,
  nativeCurrency: {
    name: chain.nativeCurrency.name,
    symbol: chain.nativeCurrency.symbol,
    decimals: chain.nativeCurrency.decimals
  },
  rpcUrls: {
    default: { http: [chain.rpcUrls.default.http[0]] },
    public: { http: [chain.rpcUrls.public.http[0]] }
  },
  blockExplorers: chain.blockExplorers ? {
    default: {
      name: chain.blockExplorers.default.name,
      url: chain.blockExplorers.default.url
    }
  } : undefined
}))

const appKit = createAppKit({
  projectId,
  metadata,
  networks: appKitNetworks,
  adapters: [new WagmiAdapter({
    config: wagmiConfig
  })]
})

export { wagmiConfig, appKit }