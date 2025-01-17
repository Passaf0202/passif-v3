import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWeb3Modal } from '@web3modal/react'
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open, isOpen } = useWeb3Modal()
  const { toast } = useToast()
  const { user } = useAuth();
  const [usdBalance, setUsdBalance] = useState<string | null>(null);

  // Configurer useBalance avec chainId pour s'assurer qu'on utilise le bon réseau
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address,
    enabled: isConnected && !!address,
    watch: true,
    cacheTime: 5000, // Rafraîchir toutes les 5 secondes
    staleTime: 2000, // Considérer les données comme périmées après 2 secondes
  });

  console.log("Balance data:", balance);
  console.log("Connected address:", address);

  useEffect(() => {
    const fetchUsdBalance = async () => {
      if (balance?.formatted) {
        try {
          const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&precision=4`);
          const data = await response.json();
          const ethPrice = data.ethereum.usd;
          const balanceInUsd = parseFloat(balance.formatted) * ethPrice;
          console.log("ETH Price:", ethPrice);
          console.log("Balance in ETH:", balance.formatted);
          console.log("Calculated USD balance:", balanceInUsd);
          setUsdBalance(balanceInUsd.toFixed(2));
        } catch (error) {
          console.error('Error fetching USD price:', error);
          setUsdBalance(null);
        }
      } else {
        setUsdBalance(null);
      }
    };

    if (balance) {
      fetchUsdBalance();
    }
  }, [balance]);

  useEffect(() => {
    if (isConnected && address && user) {
      updateUserProfile(address);
    }
  }, [isConnected, address, user]);

  const updateUserProfile = async (walletAddress: string) => {
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
  };

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
      {isConnected && (
        <div className="hidden md:flex items-center gap-2 bg-primary/5 py-1.5 px-3 rounded-full">
          <Wallet className="h-4 w-4 text-primary" />
          <div className="text-xs">
            {isBalanceLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Chargement...
              </span>
            ) : balance ? (
              <div className="flex items-center gap-2">
                <span className="text-green-600">${usdBalance}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}
      
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