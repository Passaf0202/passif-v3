import { createConfig, configureChains } from 'wagmi';
import { Chain } from 'viem/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';

export const projectId = '3225e25c4d47b78232829662814a3d58';

// Configuration du réseau Polygon Amoy Testnet
const polygonAmoy: Chain = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://polygon-amoy.blockpi.network/v1/rpc/public',
        'https://polygon-amoy.public.blastapi.io',
        'https://rpc.ankr.com/polygon_amoy'
      ],
    },
    public: {
      http: [
        'https://polygon-amoy.blockpi.network/v1/rpc/public',
        'https://polygon-amoy.public.blastapi.io',
        'https://rpc.ankr.com/polygon_amoy'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
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