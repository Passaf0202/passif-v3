import { useAccount, useDisconnect } from 'wagmi'
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWeb3Modal } from '@web3modal/react'
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { WalletBalance } from './wallet/WalletBalance';

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open, isOpen } = useWeb3Modal()
  const { toast } = useToast()
  const { user } = useAuth();

  const updateUserProfile = useCallback(async (walletAddress: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          wallet_address: walletAddress,
        })
        .eq('id', user?.id);

      if (error) throw error;
      console.log('Profile updated with wallet address:', walletAddress);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isConnected && address && user) {
      updateUserProfile(address);
    }
  }, [isConnected, address, user, updateUserProfile]);

  const handleConnect = async () => {
    try {
      if (!user) {
        toast({
          title: "Connexion requise 😊",
          description: "Veuillez vous connecter à votre compte avant d'ajouter un portefeuille",
        });
        return;
      }

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
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isConnected && <WalletBalance />}
      
      <Button 
        onClick={handleConnect}
        disabled={isOpen}
        variant={isConnected ? "outline" : "default"}
        className="h-10 px-3 md:px-4 whitespace-nowrap bg-primary hover:bg-primary/90 text-white text-sm md:text-base min-w-[120px] md:min-w-[140px] flex-shrink-0"
      >
        {isOpen ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion...
          </>
        ) : isConnected ? (
          `${address?.slice(0, 4)}...${address?.slice(-4)}`
        ) : (
          'Connecter Wallet'
        )}
      </Button>
    </div>
  );
}