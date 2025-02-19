
import { useToast } from "@/components/ui/use-toast";
import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useNetwork } from 'wagmi';
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

interface MobileWalletRedirectProps {
  isProcessing: boolean;
  onConfirm: () => Promise<void>;
  action: 'payment' | 'release';
}

export function MobileWalletRedirect({ 
  isProcessing, 
  onConfirm, 
  action 
}: MobileWalletRedirectProps) {
  const { toast } = useToast();
  const { connector } = useAccount();
  const { chain } = useNetwork();
  const { open } = useWeb3Modal();

  const getCurrentDappUrl = () => {
    if (typeof window === 'undefined') return '';
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${hostname}`;
  };

  const getWalletDeepLink = () => {
    // Debug du provider Ethereum
    console.log('Provider info:', {
      isMetaMask: window.ethereum?.isMetaMask,
      isWalletConnect: connector?.id === 'walletConnect',
      provider: window.ethereum?.provider,
      connectorName: connector?.name,
      connectorId: connector?.id,
      hasEthereum: !!window.ethereum
    });

    const dappUrl = getCurrentDappUrl();
    console.log('Current dApp URL:', dappUrl);

    // Détecter si nous sommes sur mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      console.log('Not on mobile, skipping deep link');
      return null;
    }

    // Si c'est WalletConnect, pas besoin de redirection supplémentaire
    if (connector?.id === 'walletConnect') {
      console.log('Using WalletConnect, no deep link needed');
      return null;
    }

    // Différentes implémentations d'universal links selon le wallet
    const walletInfo = {
      name: connector?.name?.toLowerCase() || '',
      providerId: window.ethereum?.provider?.name?.toLowerCase() || '',
      isMetaMask: window.ethereum?.isMetaMask,
      isZerion: 'isZerion' in (window.ethereum?.provider || {})
    };

    console.log('Wallet info:', walletInfo);

    // URLs par défaut pour chaque wallet supporté, inspiré par l'approche d'OpenSea
    const walletUrls = {
      metamask: `https://metamask.app.link/dapp/${dappUrl.replace('https://', '')}`,
      trust: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(dappUrl)}`,
      coinbase: `https://wallet.coinbase.com/dapp/${dappUrl.replace('https://', '')}`,
      rainbow: `https://rainbow.me/dapp/${dappUrl.replace('https://', '')}`,
      zerion: `https://app.zerion.io/connect?url=${encodeURIComponent(dappUrl)}`
    };

    // Détection du wallet et retour de l'URL appropriée
    if (walletInfo.isMetaMask) {
      return walletUrls.metamask;
    } else if (walletInfo.isZerion) {
      return walletUrls.zerion;
    } else if (walletInfo.name.includes('trust') || walletInfo.providerId.includes('trust')) {
      return walletUrls.trust;
    } else if (walletInfo.name.includes('coinbase') || walletInfo.providerId.includes('coinbase')) {
      return walletUrls.coinbase;
    } else if (walletInfo.name.includes('rainbow') || walletInfo.providerId.includes('rainbow')) {
      return walletUrls.rainbow;
    }

    // Si aucun wallet n'est détecté explicitement, essayer d'utiliser MetaMask par défaut
    if (window.ethereum) {
      return walletUrls.metamask;
    }

    console.log('No matching wallet found');
    return null;
  };

  const handleRedirect = async () => {
    try {
      if (!connector) {
        await open();
        return;
      }

      // Obtenir le lien deep link
      const deepLink = getWalletDeepLink();
      console.log('Deep link URL:', deepLink);

      // Si c'est WalletConnect ou desktop, juste lancer la transaction
      if (!deepLink) {
        console.log('No deep link needed, proceeding with transaction');
        await onConfirm();
        return;
      }

      // Pour les autres cas, lancer la transaction puis rediriger
      console.log('Starting transaction before redirect');
      try {
        await onConfirm();
        console.log('Transaction started successfully');

        // Courte pause pour s'assurer que la transaction est initiée
        await new Promise(resolve => setTimeout(resolve, 500));

        // Redirection vers le wallet
        console.log('Redirecting to wallet:', deepLink);
        window.location.href = deepLink;
      } catch (error) {
        console.error('Error during transaction or redirect:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Mobile wallet redirect error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleRedirect}
      disabled={isProcessing}
      className="w-full bg-primary hover:bg-primary/90 text-white"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {action === 'payment' ? 'Transaction en cours...' : 'Libération en cours...'}
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          {action === 'payment' 
            ? 'Confirmer le paiement dans votre wallet' 
            : 'Confirmer la libération dans votre wallet'}
        </>
      )}
    </Button>
  );
}
