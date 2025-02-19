
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

  const handleRedirect = async () => {
    try {
      // Si pas de connector, on ouvre la modal de connexion
      if (!connector) {
        await open();
        return;
      }

      // Pour les wallets mobiles, on lance directement la transaction
      // WalletConnect s'occupera de la redirection
      console.log('Starting transaction...');
      await onConfirm();
      console.log('Transaction started successfully');
      
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
