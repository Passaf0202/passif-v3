import { createConfig, configureChains } from 'wagmi';
import { Chain } from 'viem/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';

export const projectId = '3225e25c4d47b78232829662814a3d58';

// Configuration du réseau Polygon Amoy Testnet
const polygonAmoy: Chain = {
  id: 80002,
  name: 'Polygon Amoy Testnet',
  network: 'polygon-amoy',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
    public: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'OKLink Explorer',
      url: 'https://www.oklink.com/amoy',
    },
  },
  testnet: true,
};

const { publicClient, webSocketPublicClient } = configureChains(
  [polygonAmoy],
  [
    publicProvider(),
    w3mProvider({ projectId })
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ 
    projectId,
    chains: [polygonAmoy]
  }),
  publicClient,
  webSocketPublicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, [polygonAmoy]);