
import { useToast } from "@/components/ui/use-toast";
import { useWeb3Modal } from '@web3modal/wagmi/react';
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
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();

  const handleRedirect = async () => {
    try {
      // Si l'utilisateur n'est pas connecté, ouvrir WalletConnect
      if (!isConnected) {
        console.log("Opening WalletConnect modal...");
        await open();
        return;
      }

      // Une fois connecté, on lance directement la transaction
      // WalletConnect s'occupera de rediriger vers l'app du wallet si nécessaire
      await onConfirm();
      
    } catch (error: any) {
      console.error('Mobile wallet redirect error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const buttonText = action === 'payment' 
    ? isProcessing ? 'Transaction en cours...' : 'Payer avec mon wallet'
    : isProcessing ? 'Libération en cours...' : 'Confirmer la libération';

  // Style unifié avec la version desktop
  return (
    <Button 
      onClick={handleRedirect}
      disabled={isProcessing}
      className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-md py-5 h-auto"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {buttonText}
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-5 w-5" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
