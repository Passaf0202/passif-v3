
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
    // Si on est sur mobile et qu'on a ethereum dans window, c'est probablement MetaMask
    if (window.ethereum?.isMetaMask) {
      console.log('MetaMask detected via window.ethereum');
      return 'metamask://';
    }

    // WalletConnect v2 expose le nom du wallet connecté
    const walletName = connector?.name?.toLowerCase() || '';
    console.log('Detected wallet name:', walletName);
    
    // Mapping des deep links
    const deepLinks: { [key: string]: string } = {
      'metamask': 'metamask://',
      'trust wallet': 'trust://',
      'rainbow': 'rainbow://',
      'coinbase wallet': 'cbwallet://',
      'injected': 'metamask://',
      'metamask-mobile': 'metamask://',
      'coinbase': 'cbwallet://',
      'trust': 'trust://'
    };

    // Recherche de correspondance
    for (const [key, link] of Object.entries(deepLinks)) {
      if (walletName.includes(key)) {
        console.log(`Matched wallet ${key} with deep link ${link}`);
        return link;
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
          description: "Veuillez utiliser un wallet compatible (MetaMask, Trust Wallet, Rainbow, Coinbase Wallet)",
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
