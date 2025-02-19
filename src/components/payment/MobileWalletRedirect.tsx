
import { useToast } from "@/components/ui/use-toast";
import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useNetwork, usePublicClient } from 'wagmi';
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { ethers } from "ethers";

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
  const { connector, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { open } = useWeb3Modal();
  const publicClient = usePublicClient();

  const ensureProvider = async () => {
    console.log("Checking provider status:", {
      isConnected,
      hasEthereum: !!window.ethereum,
      connectorName: connector?.name,
      hasPublicClient: !!publicClient
    });

    if (!isConnected) {
      console.log("Not connected, opening web3modal");
      await open();
      return false;
    }

    // Vérifier si nous avons un provider valide
    let provider;
    try {
      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else if (publicClient) {
        // Utiliser le publicClient comme fallback
        provider = new ethers.providers.JsonRpcProvider(publicClient.chain.rpcUrls.default.http[0]);
      }

      if (!provider) {
        throw new Error("Aucun provider disponible");
      }

      // Tester le provider
      await provider.getNetwork();
      console.log("Provider successfully initialized");
      return true;
    } catch (error) {
      console.error("Provider initialization error:", error);
      return false;
    }
  };

  const handleRedirect = async () => {
    try {
      // Vérifier le provider avant tout
      const hasProvider = await ensureProvider();
      if (!hasProvider) {
        console.log("No valid provider found");
        toast({
          title: "Erreur de connexion",
          description: "Veuillez vous connecter à votre wallet avant de continuer",
          variant: "destructive",
        });
        return;
      }

      console.log("Starting transaction with valid provider");
      await onConfirm();
      console.log("Transaction started successfully");
      
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
