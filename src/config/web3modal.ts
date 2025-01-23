import { createConfig, configureChains } from 'wagmi';
import { polygonMumbai } from 'viem/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';

export const projectId = '3225e25c4d47b78232829662814a3d58';

// Configuration de Mumbai avec des providers spécifiques
const mumbai = {
  ...polygonMumbai,
  rpcUrls: {
    ...polygonMumbai.rpcUrls,
    default: {
      http: ['https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78']
    },
    public: {
      http: ['https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78']
    }
  }
};

const { publicClient, webSocketPublicClient } = configureChains(
  [mumbai],
  [
    infuraProvider({ apiKey: '4458cf4d1689497b9a38b1d6bbf05e78' }),
    publicProvider(),
    w3mProvider({ projectId })
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ 
    projectId,
    version: 2, // Ajout de la version explicite
    chains: [mumbai]
  }),
  publicClient,
  webSocketPublicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, [mumbai]);