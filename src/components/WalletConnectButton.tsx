
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWeb3Modal } from '@web3modal/react';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";

interface WalletConnectButtonProps {
  minimal?: boolean;
}

export function WalletConnectButton({ minimal = false }: WalletConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
    }
  }, [isConnected]);

  const updateUserProfile = useCallback(async (walletAddress: string) => {
    if (!user?.id) {
      console.log('No user ID available for profile update');
      return;
    }

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
        setIsConnecting(true);
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

  return (
    <Button 
      onClick={handleConnect}
      disabled={isConnecting}
      variant="default"
      className={`${
        minimal ? 'w-full max-w-[200px]' : 'w-full'
      } h-10 rounded-full bg-black hover:bg-black/90 text-white font-normal flex items-center justify-center gap-2`}
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
