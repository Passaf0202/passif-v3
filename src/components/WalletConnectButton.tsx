
import { useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { walletkit } from '@/config/walletkit';

interface WalletConnectButtonProps {
  minimal?: boolean;
}

export function WalletConnectButton({ minimal = false }: WalletConnectButtonProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { address, isConnecting } = walletkit.useAccount();

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
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (address && user) {
      updateUserProfile(address);
    }
  }, [address, user, updateUserProfile]);

  const handleConnect = async () => {
    try {
      if (address) {
        console.log("Déconnexion du wallet...");
        await walletkit.disconnect();
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
        return;
      }

      if (!user) {
        toast({
          title: "Connexion requise 😊",
          description: "Veuillez vous connecter à votre compte avant d'ajouter un portefeuille",
        });
        return;
      }

      console.log("Ouverture du connecteur de wallet...");
      await walletkit.connect();
      
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au portefeuille",
        variant: "destructive",
      });
    }
  };

  return minimal ? (
    <Button 
      onClick={handleConnect}
      variant="ghost" 
      size="icon"
      disabled={isConnecting}
      className="rounded-full"
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
      variant="outline"
      disabled={isConnecting}
      className="w-full h-10 rounded-full border-2 hover:bg-gray-100 font-medium flex items-center justify-center gap-2 transition-all duration-200"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connexion en cours...</span>
        </>
      ) : address ? (
        <>
          <Wallet className="h-4 w-4" />
          <span>{`${address.slice(0, 4)}...${address.slice(-4)}`}</span>
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
