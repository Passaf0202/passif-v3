
import { motion } from "framer-motion";
import { DiamondViewer } from "./DiamondViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { BadgeCheck, Wallet, Loader2, Check } from "lucide-react";
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
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (transactionState === 'wallet-connect') {
      toast({
        title: "Déconnecté",
        description: "Votre portefeuille a été déconnecté"
      });
      onStateChange('initial');
      return;
    }

    setIsConnecting(true);
    onStateChange('wallet-connecting');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsConnecting(false);
    onStateChange('wallet-connect');
    toast({
      title: "Connecté",
      description: "Votre portefeuille est maintenant connecté"
    });
  };

  const handlePayment = async () => {
    onStateChange('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    onStateChange('awaiting-confirmation');
  };

  const handleConfirmDelivery = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    onStateChange('confirmed');
    toast({
      title: "Succès !",
      description: "Les fonds ont été libérés au vendeur."
    });
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
        <div className="w-full max-w-[360px] mx-auto flex items-center justify-between px-[13px] pointer-events-auto">
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
            className="pointer-events-auto z-50"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting} 
                  variant="default" 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0 px-0 mx-[4px] mobile-wallet-button relative pointer-events-auto z-50"
                >
                  {isConnecting ? (
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

      <div className="flex-1 flex flex-col relative pointer-events-auto z-40">
        <div className="w-full max-w-[360px] mx-auto pointer-events-auto">
          <div className="h-[180px] w-full relative px-5">
            <motion.div 
              ref={modelContainerRef} 
              className="w-full h-full pointer-events-none"
            >
              <DiamondViewer state={transactionState} />
            </motion.div>
          </div>

          <div className="space-y-3 -mt-6 px-5 pointer-events-auto relative z-50">
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
                  className="pointer-events-auto z-50"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleConfirmDelivery}
                        className="w-full h-8 rounded-full px-3 text-sm transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white pointer-events-auto"
                      >
                        Confirmer la réception
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Confirmer la réception du produit</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ) : (
                <motion.div
                  animate={{
                    scale: transactionState === 'wallet-connect' ? [1, 1.02, 1] : 1
                  }}
                  transition={{
                    duration: 1,
                    repeat: transactionState === 'wallet-connect' ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                  className="pointer-events-auto z-50"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={transactionState === 'wallet-connect' ? handlePayment : handleConnect}
                        disabled={transactionState === 'processing' || transactionState === 'confirmed'}
                        className={`w-full h-8 rounded-full px-3 text-sm transition-colors duration-200 bg-[#000000] hover:bg-[#000000]/90 text-white pointer-events-auto ${transactionState === 'confirmed' ? 'opacity-50' : ''}`}
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{getTransactionMessage()}</p>
                    </TooltipContent>
                  </Tooltip>
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
