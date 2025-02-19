
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

    // Si on est sur mobile et qu'on a ethereum dans window
    if (window.ethereum?.isMetaMask) {
      console.log('MetaMask detected via window.ethereum');
      return 'metamask://';
    }

    // Récupérer le nom du wallet
    const walletName = connector?.name?.toLowerCase() || '';
    const providerId = window.ethereum?.provider?.name?.toLowerCase() || '';
    
    console.log('Detected wallet info:', {
      walletName,
      providerId,
      ethereum: window.ethereum
    });
    
    // Mapping des deep links avec ajout de Zerion
    const deepLinks: { [key: string]: string } = {
      'metamask': 'metamask://',
      'trust wallet': 'trust://',
      'rainbow': 'rainbow://',
      'coinbase wallet': 'cbwallet://',
      'zerion': 'zerion://',
      'injected': 'metamask://',
      'metamask-mobile': 'metamask://',
      'coinbase': 'cbwallet://',
      'trust': 'trust://'
    };

    // Vérifier d'abord le provider ID
    if (providerId) {
      for (const [key, link] of Object.entries(deepLinks)) {
        if (providerId.includes(key)) {
          console.log(`Matched provider ${key} with deep link ${link}`);
          return link;
        }
      }
    }

    // Ensuite vérifier le nom du connector
    if (walletName) {
      for (const [key, link] of Object.entries(deepLinks)) {
        if (walletName.includes(key)) {
          console.log(`Matched wallet ${key} with deep link ${link}`);
          return link;
        }
      }
    }

    // Si aucune correspondance n'est trouvée mais qu'on a un provider, on essaie de deviner
    if (window.ethereum?.provider) {
      console.log('Trying to guess wallet from provider:', window.ethereum.provider);
      if (typeof window.ethereum.provider === 'object') {
        // Tenter de détecter Zerion ou d'autres wallets par leurs propriétés spécifiques
        if ('isZerion' in window.ethereum.provider || walletName.includes('zerion')) {
          return 'zerion://';
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
        // Commencer la transaction
        try {
          await onConfirm();
          console.log('Transaction started successfully');

          // Forcer une courte pause pour s'assurer que la transaction est initiée
          await new Promise(resolve => setTimeout(resolve, 500));

          // Utiliser window.location.href pour la redirection
          console.log('Redirecting to wallet app:', deepLink);
          window.location.href = deepLink;
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
