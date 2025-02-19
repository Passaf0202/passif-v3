
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
    // WalletConnect v2 expose le nom du wallet connecté
    const walletName = connector?.name?.toLowerCase() || '';
    console.log('Detected wallet name:', walletName); // Debug log
    
    // Mapping des deep links des principaux wallets avec plus de variations possibles
    const deepLinks: { [key: string]: string } = {
      'metamask': 'metamask://',
      'trust wallet': 'trust://',
      'rainbow': 'rainbow://',
      'coinbase wallet': 'cbwallet://',
      // Ajout de variations courantes
      'injected': 'metamask://', // MetaMask est souvent détecté comme 'injected'
      'metamask-mobile': 'metamask://',
      'coinbase': 'cbwallet://',
      'trust': 'trust://'
    };

    // Trouver le premier deep link qui correspond au nom du wallet
    const matchedWallet = Object.keys(deepLinks).find(key => 
      walletName.includes(key)
    );

    console.log('Matched wallet:', matchedWallet); // Debug log
    console.log('Available deep link:', matchedWallet ? deepLinks[matchedWallet] : 'none'); // Debug log

    return matchedWallet ? deepLinks[matchedWallet] : null;
  };

  const handleRedirect = async () => {
    try {
      if (!connector) {
        await open();
        return;
      }

      // Lancer d'abord l'action pour démarrer la transaction
      await onConfirm();

      const deepLink = getWalletDeepLink();
      console.log('Attempting redirect with deep link:', deepLink); // Debug log

      if (deepLink) {
        // Petit délai pour laisser le temps à la transaction de démarrer
        setTimeout(() => {
          window.location.href = deepLink;
        }, 500);
      } else {
        console.error('No deep link found for wallet:', connector.name); // Debug log
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
