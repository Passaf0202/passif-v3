
import { createConfig, configureChains, Chain } from 'wagmi';
import { amoy } from './chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

export const projectId = '3225e25c4d47b78232829662814a3d58';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [amoy],
  [w3mProvider({ projectId }), publicProvider()]
);

const connectors = [
  new InjectedConnector({ chains }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId,
      metadata: {
        name: 'Tradecoiner',
        description: 'Application Tradecoiner',
        url: window.location.origin,
        icons: ['https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Tradecoiner%20(texte).png']
      }
    }
  }),
  ...w3mConnectors({ projectId, chains })
];

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
