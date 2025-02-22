
import { createConfig } from 'wagmi'
import { amoy } from './chains'
import { createPublicClient, http } from 'viem'

export const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: amoy,
    transport: http()
  }),
})
