import { motion } from "framer-motion";
import { DiamondViewer } from "./DiamondViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { BadgeCheck, Wallet, Loader2 } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TransactionState = 'initial' | 'wallet-connect' | 'wallet-connecting' | 'payment' | 'processing' | 'confirmed';

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  showWalletSpotlight: boolean;
}

export function MobilePhoneContent({
  transactionState,
  showWalletSpotlight
}: MobilePhoneContentProps) {
  const modelContainerRef = useRef<HTMLDivElement>(null);
  const {
    address,
    isConnected
  } = useAccount();
  const {
    disconnect
  } = useDisconnect();
  const {
    open,
    isOpen
  } = useWeb3Modal();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();

  const handleConnect = async () => {
    try {
      if (!user) {
        toast({
          title: "Connexion requise 😊",
          description: "Veuillez vous connecter à votre compte avant d'ajouter un portefeuille"
        });
        return;
      }
      if (isConnected) {
        await disconnect();
        toast({
          title: "Déconnecté",
          description: "Votre portefeuille a été déconnecté"
        });
      } else {
        console.log('Tentative de connexion au wallet...');
        await open();
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au portefeuille. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="absolute inset-0 flex flex-col bg-white">
        <StatusBar />
        <DynamicIsland />
        
        <div className="absolute top-[12px] left-0 right-0 px-4 flex items-center justify-between z-40">
          <img 
            src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Tradecoiner%20(texte).png" 
            alt="Tradecoiner" 
            className="h-5 w-auto object-contain"
          />
          <motion.div
            animate={{
              scale: showWalletSpotlight ? [1, 1.05, 1] : 1
            }}
            transition={{
              duration: 1,
              repeat: showWalletSpotlight ? Infinity : 0,
              repeatType: "reverse"
            }}
          >
            <Button 
              onClick={handleConnect} 
              disabled={isOpen} 
              className="h-10 w-10 rounded-full pure-black-bg text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              {isOpen ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Wallet className="h-4 w-4 text-white" strokeWidth={2} />
              )}
            </Button>
          </motion.div>
        </div>

        <main className="flex-1 flex flex-col relative mt-8">
          <div className="w-full max-w-[360px] mx-auto">
            <div className="h-[140px] w-full relative px-5">
              <motion.div ref={modelContainerRef} className="w-full h-full" animate={{
                scale: transactionState === 'confirmed' ? [1, 1.05, 1] : 1
              }} transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}>
                <DiamondViewer state={transactionState} />
              </motion.div>
            </div>

            <div className="space-y-2 -mt-8 px-5">
              <div>
                <h2 className="text-lg leading-tight font-semibold text-[#000000]">Diamant</h2>
              </div>

              <div className="space-y-2">
                <div className="space-y-1.5">
                  <div className="w-full h-[2px] bg-gray-200/80" />
                  <div className="w-full h-[2px] bg-gray-200/80" />
                </div>

                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full h-8 rounded-full px-3 text-sm transition-colors duration-200 pure-black-bg hover:bg-black/90 text-white"
                >
                  Payer 20 ETH
                </Button>
                
                <div className="space-y-1.5">
                  <div className="w-full h-[2px] bg-gray-200/80" />
                  <div className="w-full h-[2px] bg-gray-200/80" />
                  <div className="w-full h-[2px] bg-gray-200/80" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
