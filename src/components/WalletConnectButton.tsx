
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
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
  const { open } = useWeb3Modal();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isConnected && chain?.id !== amoy.id) {
      switchNetwork?.(amoy.id);
    }
  }, [isConnected, chain?.id, switchNetwork]);

  const updateUserProfile = useCallback(async (walletAddress: string) => {
    if (!user?.id) return;

    try {
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
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (isConnected && address && user) {
      updateUserProfile(address);
    }
  }, [isConnected, address, user, updateUserProfile]);

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Connexion requise 😊",
        description: "Veuillez vous connecter à votre compte avant d'ajouter un portefeuille",
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      if (isConnected) {
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
        await open();
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
    >
      <Wallet className="h-5 w-5" />
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
