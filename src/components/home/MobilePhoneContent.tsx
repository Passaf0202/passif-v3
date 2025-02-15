
import { motion } from "framer-motion";
import { DiamondViewer } from "./DiamondViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { BadgeCheck, Wallet, Loader2, Check } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/react';
import { useToast } from "@/hooks/use-toast";
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
  const [isPaymentButtonActive, setIsPaymentButtonActive] = useState(false);

  const handleConnect = async () => {
    try {
      if (isConnected) {
        await disconnect();
        toast({
          title: "Déconnecté",
          description: "Votre portefeuille a été déconnecté"
        });
        onStateChange('initial');
      } else {
        onStateChange('wallet-connecting');
        console.log('Tentative de connexion au wallet...');
        await open();
        onStateChange('wallet-connect');
        setIsPaymentButtonActive(true);
      }
    } catch (error) {
      console.error('Connection error:', error);
      onStateChange('initial');
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au portefeuille. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handlePayment = async () => {
    try {
      onStateChange('processing');
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      onStateChange('awaiting-confirmation');
    } catch (error) {
      console.error('Payment error:', error);
      onStateChange('payment');
      toast({
        title: "Erreur",
        description: "Le paiement a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      // Ici nous simulerons la libération des fonds
      await new Promise(resolve => setTimeout(resolve, 1500));
      onStateChange('confirmed');
      toast({
        title: "Succès !",
        description: "Les fonds ont été libérés au vendeur."
      });
    } catch (error) {
      console.error('Confirmation error:', error);
      toast({
        title: "Erreur",
        description: "La confirmation a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const getTransactionMessage = () => {
    switch (transactionState) {
      case 'initial':
        return "Connectez votre portefeuille pour commencer";
      case 'wallet-connect':
        return "Votre portefeuille est connecté !";
      case 'payment':
        return "Prêt pour le paiement";
      case 'processing':
        return "Transaction en cours...";
      case 'awaiting-confirmation':
        return "En attente de confirmation de réception";
      case 'confirmed':
        return "Transaction terminée !";
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
                  ) : transactionState === 'wallet-connect' ? (
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

              {transactionState === 'awaiting-confirmation' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleConfirmDelivery}
                    className="w-full h-8 rounded-full px-3 text-sm transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Confirmer la réception
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  animate={{
                    scale: transactionState === 'wallet-connect' && !isPaymentButtonActive ? [1, 1.02, 1] : 1
                  }}
                  transition={{
                    duration: 1,
                    repeat: transactionState === 'wallet-connect' && !isPaymentButtonActive ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                >
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={transactionState === 'wallet-connect' ? handlePayment : handleConnect}
                    disabled={transactionState === 'processing' || transactionState === 'confirmed'}
                    className={`w-full h-8 rounded-full px-3 text-sm transition-colors duration-200 bg-[#000000] hover:bg-[#000000]/90 text-white ${transactionState === 'confirmed' ? 'opacity-50' : ''}`}
                  >
                    {transactionState === 'processing' ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                        Transaction en cours...
                      </>
                    ) : transactionState === 'confirmed' ? (
                      'Transaction terminée'
                    ) : transactionState === 'wallet-connect' ? (
                      'Payer 20 ETH'
                    ) : (
                      'Connecter le portefeuille'
                    )}
                  </Button>
                </motion.div>
              )}
              
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
