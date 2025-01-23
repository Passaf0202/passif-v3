import { createConfig, configureChains } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';

export const projectId = '3225e25c4d47b78232829662814a3d58';

const { publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai],
  [
    w3mProvider({ projectId }),
    publicProvider()
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ 
    projectId,
    chains: [polygonMumbai],
  }),
  publicClient,
  webSocketPublicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, [polygonMumbai]);