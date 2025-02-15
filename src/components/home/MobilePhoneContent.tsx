
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
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open, isOpen } = useWeb3Modal();
  const { toast } = useToast();
  const { user } = useAuth();

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

  return <TooltipProvider>
      <div className="absolute inset-0 flex flex-col bg-white pt-4">
        <div className="h-12 flex items-center mb-2">
          <div className="w-full max-w-[360px] mx-auto flex items-center justify-between px-[13px]">
            <img src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Tradecoiner%20(texte).png" alt="Tradecoiner" className="h-4 w-auto mobile-logo" />
            <motion.div animate={{
            scale: showWalletSpotlight ? [1, 1.05, 1] : 1
          }} transition={{
            duration: 1,
            repeat: showWalletSpotlight ? Infinity : 0,
            repeatType: "reverse"
          }}>
              <Button onClick={handleConnect} disabled={isOpen} variant="default" size="sm" className="h-8 w-8 rounded-full p-0 px-0 mx-[4px] mobile-wallet-button">
                {isOpen ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white" /> : <Wallet className="h-3.5 w-3.5 text-white" strokeWidth={2} />}
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative">
          <div className="w-full max-w-[360px] mx-auto">
            <div className="h-[100px] w-full relative px-5">
              <motion.div ref={modelContainerRef} className="w-full h-full" animate={{
              scale: transactionState === 'confirmed' ? [1, 1.05, 1] : 1
            }} transition={{
              duration: 0.5,
              ease: "easeInOut"
            }}>
                <DiamondViewer state={transactionState} />
              </motion.div>
            </div>

            <div className="space-y-3 -mt-6 px-5">
              <div className="space-y-2">
                <h2 className="text-lg leading-tight font-semibold text-[#000000]">Diamant</h2>
                <div className="flex items-center">
                  <div className="flex items-center bg-[#F6F6F7] px-2 py-0.5 rounded-full h-4">
                    <Tooltip>
                      <TooltipTrigger>
                        <BadgeCheck className="h-2.5 w-2.5 text-black mr-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Certifié</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-[9px] font-medium text-black">Profil vérifié</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="w-full h-[2px] bg-gray-200/80" />
                  <div className="w-full h-[2px] bg-gray-200/80" />
                </div>

                <Button variant="default" size="sm" className="w-full h-8 rounded-full px-3 text-sm transition-colors duration-200 bg-[#000000] hover:bg-[#000000]/90 text-white">
                  Payer 20 ETH
                </Button>
                
                <div className="space-y-2">
                  <div className="w-full h-[2px] bg-gray-200/80" />
                  <div className="w-full h-[2px] bg-gray-200/80" />
                  <div className="w-full h-[2px] bg-gray-200/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>;
}
