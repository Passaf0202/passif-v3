
import { Chain } from 'wagmi';

export const amoy: Chain = {
  id: 80_002,
  name: 'Polygon Amoy',
  network: 'polygon_amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { 
      http: ['https://rpc-amoy.polygon.technology'],
      webSocket: ['wss://rpc-amoy.polygon.technology']
    },
    default: { 
      http: ['https://rpc-amoy.polygon.technology'],
      webSocket: ['wss://rpc-amoy.polygon.technology']
    },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://www.oklink.com/amoy' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11_907_934,
    },
  },
  testnet: true,
};
