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

const appKit = createAppKit({
  projectId,
  metadata,
  networks: [mainnet, sepolia],
  adapters: [new WagmiAdapter({
    wagmiConfig,
    chains
  })]
})

export { wagmiConfig, appKit }