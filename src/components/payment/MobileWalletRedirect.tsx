
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

  const getWalletDeepLink = () => {
    // Debug du provider Ethereum
    console.log('Provider info:', {
      isMetaMask: window.ethereum?.isMetaMask,
      provider: window.ethereum?.provider,
      connectorName: connector?.name,
      connectorId: connector?.id,
      hasEthereum: !!window.ethereum
    });

    if (typeof window !== 'undefined' && window.ethereum) {
      // Détecter si nous sommes sur mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (!isMobile) {
        console.log('Not on mobile, skipping deep link');
        return null;
      }

      // Vérifier si MetaMask est disponible
      if (window.ethereum.isMetaMask) {
        console.log('MetaMask detected, using metamask deep link');
        return 'https://metamask.app.link/dapp/321540df-6d8a-4916-b589-ad0dd0aad4aa.lovableproject.com';
      }

      // Vérifier Zerion
      const provider = window.ethereum.provider;
      if (provider && 'isZerion' in provider) {
        console.log('Zerion detected, using zerion deep link');
        return 'https://app.zerion.io';
      }
    }

    // Récupérer le nom du wallet pour les autres cas
    const walletName = connector?.name?.toLowerCase() || '';
    const providerId = window.ethereum?.provider?.name?.toLowerCase() || '';
    
    console.log('Detected wallet info:', {
      walletName,
      providerId,
      ethereum: window.ethereum
    });
    
    // Mapping des deep links avec liens universels
    const deepLinks: { [key: string]: string } = {
      'metamask': 'https://metamask.app.link/dapp/321540df-6d8a-4916-b589-ad0dd0aad4aa.lovableproject.com',
      'trust wallet': 'https://link.trustwallet.com/open_url?url=https://321540df-6d8a-4916-b589-ad0dd0aad4aa.lovableproject.com',
      'rainbow': 'https://rainbow.me',
      'coinbase wallet': 'https://go.cb-w.com/dapp?cb_url=https://321540df-6d8a-4916-b589-ad0dd0aad4aa.lovableproject.com',
      'zerion': 'https://app.zerion.io',
      'trust': 'https://link.trustwallet.com/open_url?url=https://321540df-6d8a-4916-b589-ad0dd0aad4aa.lovableproject.com'
    };

    // Chercher une correspondance dans le provider ID
    if (providerId) {
      for (const [key, link] of Object.entries(deepLinks)) {
        if (providerId.includes(key)) {
          console.log(`Matched provider ${key} with universal link ${link}`);
          return link;
        }
      }
    }

    // Chercher une correspondance dans le nom du wallet
    if (walletName) {
      for (const [key, link] of Object.entries(deepLinks)) {
        if (walletName.includes(key)) {
          console.log(`Matched wallet ${key} with universal link ${link}`);
          return link;
        }
      }
    }

    console.log('No wallet match found');
    return null;
  };

  const handleRedirect = async () => {
    try {
      if (!connector) {
        await open();
        return;
      }

      const deepLink = getWalletDeepLink();
      console.log('Got deep link:', deepLink);

      if (deepLink) {
        console.log('Starting transaction before redirect');
        try {
          await onConfirm();
          console.log('Transaction started successfully');

          // Forcer une courte pause pour s'assurer que la transaction est initiée
          await new Promise(resolve => setTimeout(resolve, 500));

          // Ouvrir dans un nouvel onglet pour éviter les problèmes de redirection
          console.log('Opening wallet in new window:', deepLink);
          window.open(deepLink, '_blank');
        } catch (error) {
          console.error('Error during transaction or redirect:', error);
          throw error;
        }
      } else {
        console.error('No supported wallet found');
        toast({
          title: "Wallet non supporté",
          description: "Veuillez utiliser un wallet compatible (MetaMask, Trust Wallet, Rainbow, Coinbase Wallet, Zerion)",
          variant: "destructive",
        });
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
