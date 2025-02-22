
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork, useConnect } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWeb3Modal } from '@web3modal/react';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { amoy } from '@/config/chains';

interface WalletConnectButtonProps {
  minimal?: boolean;
}

export function WalletConnectButton({ minimal = false }: WalletConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { open, close } = useWeb3Modal();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect, connectors } = useConnect();

  useEffect(() => {
    const handleNetworkSwitch = async () => {
      if (isConnected && chain?.id !== amoy.id && switchNetwork) {
        try {
          console.log('Switching to Amoy network...');
          await switchNetwork(amoy.id);
        } catch (error) {
          console.error('Network switch error:', error);
        }
      }
    };

    handleNetworkSwitch();
  }, [isConnected, chain?.id, switchNetwork]);

  const updateUserProfile = useCallback(async (walletAddress: string) => {
    if (!user?.id) return;

    try {
      console.log('Updating user profile with wallet address:', walletAddress);
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: walletAddress })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Portefeuille connecté",
        description: "Votre portefeuille a été lié à votre profil",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (isConnected && address && user) {
      updateUserProfile(address);
    }
  }, [isConnected, address, user, updateUserProfile]);

  const handleConnect = async () => {
    try {
      console.log("Tentative de connexion au wallet...");
      setIsConnecting(true);
      
      if (isConnected) {
        console.log("Disconnecting wallet...");
        await disconnect();
        if (user) {
          await supabase
            .from('profiles')
            .update({ wallet_address: null })
            .eq('id', user.id);
        }
        toast({
          title: "Déconnecté",
          description: "Votre portefeuille a été déconnecté",
        });
      } else {
        if (!user) {
          toast({
            title: "Connexion requise 😊",
            description: "Veuillez vous connecter à votre compte avant d'ajouter un portefeuille",
          });
          return;
        }

        // Essayer d'abord le connecteur WalletConnect
        const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');
        if (walletConnectConnector) {
          console.log("Trying WalletConnect connector...");
          try {
            await connect({ connector: walletConnectConnector });
          } catch (error) {
            console.error("WalletConnect error:", error);
            // Si WalletConnect échoue, on ouvre la modale Web3
            await open();
          }
        } else {
          console.log("Opening Web3Modal...");
          await open();
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au portefeuille",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return minimal ? (
    <Button 
      onClick={handleConnect}
      variant="ghost" 
      size="icon" 
      className="rounded-full"
      disabled={isConnecting}
    >
      {isConnecting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Wallet className="h-5 w-5" />
      )}
    </Button>
  ) : (
    <Button 
      onClick={handleConnect}
      disabled={isConnecting}
      variant="outline"
      className="w-full h-10 rounded-full border-2 hover:bg-gray-100 font-medium flex items-center justify-center gap-2 transition-all duration-200"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connexion...</span>
        </>
      ) : isConnected ? (
        <>
          <Wallet className="h-4 w-4" />
          <span>{`${address?.slice(0, 4)}...${address?.slice(-4)}`}</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span>Connecter Wallet</span>
        </>
      )}
    </Button>
  );
}
