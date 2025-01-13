import { createConfig, configureChains, mainnet, sepolia } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from 'viem'

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

// Convert wagmi chains to AppKit compatible format
const appKitChains = chains.map(chain => ({
  id: chain.id,
  name: chain.name,
  network: chain.network,
  nativeCurrency: chain.nativeCurrency,
  rpcUrls: chain.rpcUrls,
  blockExplorers: chain.blockExplorers
}))

const appKit = createAppKit({
  projectId,
  metadata,
  networks: appKitChains,
  adapters: [new WagmiAdapter({
    chains,
    config: wagmiConfig
  })]
})

export { wagmiConfig, appKit }