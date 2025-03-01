
import { motion, AnimatePresence } from "framer-motion";
import { DiamondViewer } from "./DiamondViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { BadgeCheck, Wallet, Loader2, Check, ArrowUp, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TransactionState } from "./HeroSection";
import { SimulationIndicator } from "./SimulationIndicator";

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  onStateChange: (state: TransactionState) => void;
}

export function MobilePhoneContent({
  transactionState,
  onStateChange
}: MobilePhoneContentProps) {
  const modelContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleConnect = async () => {
    if (!hasInteracted) setHasInteracted(true);
    
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
    if (!hasInteracted) setHasInteracted(true);
    onStateChange('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    onStateChange('awaiting-confirmation');
  };

  const handleConfirmDelivery = async () => {
    if (!hasInteracted) setHasInteracted(true);
    setIsConfirming(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onStateChange('confirmed');
    setIsConfirming(false);
    toast({
      title: "Succès !",
      description: "Les fonds ont été libérés au vendeur."
    });
  };

  const handleRetry = () => {
    onStateChange('initial');
    setIsConfirming(false);
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
        <div className="w-full max-w-[360px] mx-auto flex items-center justify-between px-[13px] pointer-events-auto relative">
          <img src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Tradecoiner%20(texte).png" alt="Tradecoiner" className="h-4 w-auto mobile-logo" />
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting || transactionState === 'wallet-connecting'} 
            variant="default" 
            size="sm" 
            className="h-8 w-8 rounded-full p-0 px-0 mx-[4px] mobile-wallet-button relative pointer-events-auto z-50 bg-gradient-to-b from-black to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] active:scale-95 transition-all duration-200"
          >
            {isConnecting || transactionState === 'wallet-connecting' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
            ) : transactionState === 'wallet-connect' ? (
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            ) : (
              <Wallet className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            )}
          </Button>
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
              <div className="flex items-center">
                <div className="flex items-center bg-[#F6F6F7] px-2 py-0.5 rounded-full h-4">
                  <Tooltip>
                    <TooltipTrigger>
                      <BadgeCheck className="h-2.5 w-2.5 text-black mr-1" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center" className="tooltip-content">
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
                        disabled={isConfirming}
                        className="w-full h-8 rounded-full px-4 text-xs transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white pointer-events-auto shadow-[inset_0_2px_10px_-3px_rgba(0,0,0,0.3)] active:shadow-[inset_0_2px_5px_-3px_rgba(0,0,0,0.3)]"
                      >
                        {isConfirming ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                            <span>Confirmation en cours...</span>
                          </div>
                        ) : (
                          "Confirmer la réception"
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center" className="tooltip-content">
                      <p className="text-xs">Confirmer la réception du produit</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ) : (
                <motion.div
                  className="pointer-events-auto z-50 relative"
                >
                  {!hasInteracted && transactionState !== 'wallet-connect' && <SimulationIndicator />}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={transactionState === 'wallet-connect' ? handlePayment : handleConnect}
                        disabled={transactionState === 'processing' || transactionState === 'confirmed'}
                        className={`w-full h-8 rounded-full px-4 text-xs transition-all duration-200 bg-[#000000] hover:bg-[#000000]/90 text-white pointer-events-auto 
                          transform perspective-[800px] 
                          hover:rotate-y-[6deg] hover:-rotate-x-[4deg] 
                          hover:translate-y-[-2px]
                          active:translate-y-[1px] active:translate-z-[-4px] active:scale-[0.97]
                          shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3),0_2px_0_0_rgba(255,255,255,0.15)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset]
                          active:shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2),0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(0,0,0,0.1)_inset]
                          ${transactionState === 'confirmed' ? 'opacity-50' : ''}`}
                      >
                        {transactionState === 'processing' ? (
                          <div className="flex items-center justify-center w-full">
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                            <span className="truncate">Transaction en cours...</span>
                          </div>
                        ) : transactionState === 'confirmed' ? (
                          'Transaction terminée'
                        ) : transactionState === 'wallet-connect' ? (
                          'Payer 20 ETH'
                        ) : isConnecting || transactionState === 'wallet-connecting' ? (
                          <div className="flex items-center justify-center w-full">
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                            <span className="truncate">Connexion en cours...</span>
                          </div>
                        ) : (
                          'Connecter le portefeuille'
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center" className="tooltip-content">
                      <p className="text-xs">{getTransactionMessage()}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
              
              <div className="space-y-2">
                <div className="w-full h-[2px] bg-gray-200/80" />
                <div className="w-full h-[2px] bg-gray-200/80" />
                <div className="w-full h-[2px] bg-gray-200/80" />
                {transactionState === 'confirmed' && (
                  <div className="flex items-center justify-between">
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center bg-green-100 px-2 py-0.5 rounded-full h-4 w-fit mt-2"
                    >
                      <Check className="h-2.5 w-2.5 text-green-600 mr-1" />
                      <span className="text-[9px] font-medium text-green-600">Produit reçu</span>
                    </motion.div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRetry}
                      className="h-6 w-6 p-0"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TooltipProvider>;
}
