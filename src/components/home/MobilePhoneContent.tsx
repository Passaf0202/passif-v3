
import { motion } from "framer-motion";
import { DiamondViewer } from "./DiamondViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { CheckCircle, Wallet, User } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/react';
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

  return <div className="absolute inset-0 flex flex-col bg-white">
      {/* Header avec logo et wallet */}
      <div className="relative h-16 px-5 flex items-center">
        <img src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Tradecoiner%20(texte).png" alt="Tradecoiner" className="h-5 w-auto mr-auto" />
        <motion.button onClick={handleConnect} disabled={isOpen} animate={{
          scale: showWalletSpotlight ? [1, 1.05, 1] : 1
        }} transition={{
          duration: 1,
          repeat: showWalletSpotlight ? Infinity : 0,
          repeatType: "reverse"
        }} className="h-8 w-8 rounded-full flex items-center justify-center bg-black text-white ml-2">
          {isOpen ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" strokeWidth={2} />}
        </motion.button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col relative">
        <div className="w-full max-w-[360px] mx-auto">
          {/* Section modèle 3D */}
          <div className="h-[160px] w-full relative px-5">
            <motion.div ref={modelContainerRef} className="w-full h-full" animate={{
              scale: transactionState === 'confirmed' ? [1, 1.05, 1] : 1
            }} transition={{
              duration: 0.5,
              ease: "easeInOut"
            }}>
              <div className="absolute top-6 left-2 z-10 flex items-center space-x-2">
                <div className="flex items-center bg-muted/50 px-2 py-0.5 rounded-full h-4">
                  <User className="h-2.5 w-2.5 text-muted-foreground mr-1" />
                  <span className="text-[9px] font-medium">Saphire</span>
                </div>
                <Badge variant="default" className="h-4 inline-flex items-center gap-1 text-[9px] font-medium whitespace-nowrap px-2">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Profil vérifié
                </Badge>
              </div>
              <DiamondViewer state={transactionState} />
            </motion.div>
          </div>

          {/* Informations produit */}
          <div className="space-y-3 -mt-8 px-5">
            <div>
              <h2 className="text-lg leading-tight font-semibold text-black">Diamant</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="w-full h-[2px] bg-gray-200/80" />
                <div className="w-full h-[2px] bg-gray-200/80" />
                <div className="w-full h-[2px] bg-gray-200/80" />
              </div>

              <Button variant="default" size="sm" className="w-full h-8 bg-primary/90 hover:bg-primary/80 text-white rounded-full px-3 text-sm transition-colors duration-200">
                Payer 20 ETH
              </Button>
              
              <div className="space-y-2">
                <div className="w-full h-[2px] bg-gray-200/80" />
                <div className="w-full h-[2px] bg-gray-200/80" />
                <div className="w-full h-[2px] bg-gray-200/80" />
                <div className="w-full h-[2px] bg-gray-200/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
