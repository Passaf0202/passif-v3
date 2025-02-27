
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface WalletConnectButtonProps {
  minimal?: boolean;
  className?: string;
}

export function WalletConnectButton({ minimal = false, className }: WalletConnectButtonProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const { toast } = useToast()
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
    }
  }, [isConnected]);

  const updateUserProfile = useCallback(async (walletAddress: string) => {
    try {
      if (!user?.id) {
        console.log('No user ID available for profile update');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          wallet_address: walletAddress,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      console.log('Profile updated with wallet address:', walletAddress);
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
        setIsConnecting(false);
      } else {
        setIsConnecting(true);
        await open();
      }
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnecting(false);
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au portefeuille. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Style unifié pour desktop et mobile
  const buttonStyle = `
    ${isConnected ? 'bg-white text-primary border-2 border-primary hover:bg-gray-50' : 'bg-primary hover:bg-primary/90 text-white'}
    ${minimal ? 'w-8 p-0' : 'px-3'}
    transition-all duration-200 h-8 rounded-full whitespace-nowrap text-sm
    ${className || ''}
  `;

  return (
    <Button 
      onClick={handleConnect}
      disabled={isConnecting}
      variant={isConnected ? "outline" : "default"}
      className={buttonStyle}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {!minimal && <span className="ml-2">Connexion...</span>}
        </>
      ) : isConnected ? (
        minimal ? (
          <Wallet className="h-4 w-4" />
        ) : (
          `${address?.slice(0, 4)}...${address?.slice(-4)}`
        )
      ) : (
        minimal ? (
          <Wallet className="h-4 w-4" />
        ) : (
          'Connecter Wallet'
        )
      )}
    </Button>
  );
}
