
import { createConfig, configureChains } from 'wagmi';
import { amoy } from './chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';

// Nouveau projectId plus sécurisé
export const projectId = 'a69116ac34422ddaa0a7ad2aeeae6934';

// Configuration des chaînes avec un fallback au publicProvider
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [amoy],
  [
    w3mProvider({ projectId }), 
    publicProvider()
  ],
  {
    batch: { multicall: true },
    retryCount: 3,
    stallTimeout: 5000
  }
);

// Configuration Wagmi avec gestion d'erreur améliorée
export const wagmiConfig = createConfig({
  autoConnect: false, // Désactivé pour éviter les problèmes de reconnexion automatique
  connectors: w3mConnectors({ 
    projectId,
    chains,
    version: '2', // Utilisation de la dernière version
    options: {
      showQrModal: true,
      qrModalOptions: { themeMode: 'light' }
    }
  }),
  publicClient,
  webSocketPublicClient,
  logger: {
    warn: (message) => console.warn(message)
  }
});

// Client Ethereum avec gestion d'erreur améliorée
export const ethereumClient = new EthereumClient(wagmiConfig, chains);
