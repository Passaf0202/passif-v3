
import { motion } from "framer-motion";
import { DiamondViewer } from "./DiamondViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { BadgeCheck, Wallet, Loader2, Check, LockKeyhole } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TransactionState } from "./HeroSection";

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  showWalletSpotlight: boolean;
  onStateChange: (state: TransactionState) => void;
}

export function MobilePhoneContent({
  transactionState,
  showWalletSpotlight,
  onStateChange
}: MobilePhoneContentProps) {
  const modelContainerRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open, isOpen } = useWeb3Modal();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isReleaseLoading, setIsReleaseLoading] = useState(false);

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
        onStateChange('initial');
        toast({
          title: "Déconnecté",
          description: "Votre portefeuille a été déconnecté"
        });
      } else {
        console.log('Tentative de connexion au wallet...');
        await open();
        onStateChange('wallet-connect');
        toast({
          title: "Connecté",
          description: "Votre portefeuille est maintenant connecté"
        });
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

  const handlePayment = async () => {
    try {
      setIsPaymentLoading(true);
      onStateChange('payment');
      
      // Simuler le temps de transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onStateChange('funds-locked');
      toast({
        title: "Paiement effectué",
        description: "Les fonds sont bloqués dans l'escrow"
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur",
        description: "Le paiement a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleReleaseFunds = async () => {
    try {
      setIsReleaseLoading(true);
      
      // Simuler le temps de libération
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onStateChange('confirmed');
      toast({
        title: "Fonds libérés",
        description: "Transaction complétée avec succès"
      });
    } catch (error) {
      console.error('Release funds error:', error);
      toast({
        title: "Erreur",
        description: "La libération des fonds a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsReleaseLoading(false);
    }
  };

  const getActionButton = () => {
    if (transactionState === 'payment' || transactionState === 'initial') {
      return (
        <Button 
          variant="default" 
          size="sm" 
          disabled={transactionState !== 'wallet-connect' || isPaymentLoading}
          onClick={handlePayment}
          className="w-full h-8 rounded-full px-3 text-sm transition-colors duration-200 bg-[#000000] hover:bg-[#000000]/90 text-white"
        >
          {isPaymentLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              Transaction en cours...
            </>
          ) : (
            'Payer 20 ETH'
          )}
        </Button>
      );
    }

    if (transactionState === 'funds-locked') {
      return (
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleReleaseFunds}
          disabled={isReleaseLoading}
          className="w-full h-8 rounded-full px-3 text-sm transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white"
        >
          {isReleaseLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              Libération en cours...
            </>
          ) : (
            <>
              <LockKeyhole className="h-3.5 w-3.5 mr-2" />
              Libérer les fonds
            </>
          )}
        </Button>
      );
    }

    if (transactionState === 'confirmed') {
      return (
        <Button 
          variant="default" 
          size="sm" 
          disabled
          className="w-full h-8 rounded-full px-3 text-sm bg-[#000000] opacity-50 text-white"
        >
          Transaction terminée
        </Button>
      );
    }
  };

  const getTransactionMessage = () => {
    switch (transactionState) {
      case 'initial':
        return "Connectez votre portefeuille pour commencer";
      case 'wallet-connect':
        return "Cliquez sur 'Payer' pour démarrer la transaction";
      case 'payment':
        return "Transaction en cours...";
      case 'funds-locked':
        return "Libérez les fonds une fois le produit reçu";
      case 'confirmed':
        return "Transaction complétée avec succès !";
      default:
        return "";
    }
  };

  return <TooltipProvider>
      <div className="absolute inset-0 flex flex-col bg-white pt-10">
        <div className="h-12 flex items-center mb-[-35px]">
          <div className="w-full max-w-[360px] mx-auto flex items-center justify-between px-[13px]">
            <img src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Tradecoiner%20(texte).png" alt="Tradecoiner" className="h-4 w-auto mobile-logo" />
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
              <Tooltip>
                <TooltipTrigger>
                  <Button 
                    onClick={handleConnect} 
                    disabled={isOpen} 
                    variant="default" 
                    size="sm" 
                    className="h-8 w-8 rounded-full p-0 px-0 mx-[4px] mobile-wallet-button relative"
                  >
                    {isOpen ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    ) : transactionState !== 'initial' ? (
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                    ) : (
                      <Wallet className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{getTransactionMessage()}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative">
          <div className="w-full max-w-[360px] mx-auto">
            <div className="h-[180px] w-full relative px-5">
              <motion.div 
                ref={modelContainerRef} 
                className="w-full h-full" 
                animate={{
                  scale: transactionState === 'confirmed' ? [1, 1.05, 1] : 1,
                  rotateY: transactionState === 'confirmed' ? [0, 360] : 0
                }} 
                transition={{
                  duration: transactionState === 'confirmed' ? 1 : 0.5,
                  ease: "easeInOut"
                }}
              >
                <DiamondViewer state={transactionState} />
              </motion.div>
            </div>

            <div className="space-y-3 -mt-6 px-5">
              <div className="space-y-2">
                <h2 className="text-lg leading-tight font-semibold text-[#000000]">Diamant</h2>
                <div className="flex items-center gap-2">
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
                  {transactionState === 'funds-locked' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center bg-yellow-100 px-2 py-0.5 rounded-full h-4"
                    >
                      <LockKeyhole className="h-2.5 w-2.5 text-yellow-600 mr-1" />
                      <span className="text-[9px] font-medium text-yellow-600">Fonds bloqués</span>
                    </motion.div>
                  )}
                  {transactionState === 'confirmed' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center bg-green-100 px-2 py-0.5 rounded-full h-4"
                    >
                      <Check className="h-2.5 w-2.5 text-green-600 mr-1" />
                      <span className="text-[9px] font-medium text-green-600">Produit reçu</span>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="w-full h-[2px] bg-gray-200/80" />
                  <div className="w-full h-[2px] bg-gray-200/80" />
                </div>

                <motion.div
                  animate={{
                    scale: (transactionState === 'wallet-connect' || transactionState === 'funds-locked') ? [1, 1.02, 1] : 1
                  }}
                  transition={{
                    duration: 1,
                    repeat: (transactionState === 'wallet-connect' || transactionState === 'funds-locked') ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                >
                  {getActionButton()}
                </motion.div>
                
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
