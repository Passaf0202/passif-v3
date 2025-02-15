
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Loader2, Search, CheckCircle2, ShieldCheck } from "lucide-react";
import { DiamondViewer } from "./DiamondViewer";
import { useRef } from "react";

type TransactionState = 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  showWalletSpotlight: boolean;
}

export function MobilePhoneContent({ transactionState, showWalletSpotlight }: MobilePhoneContentProps) {
  const modelContainerRef = useRef<HTMLDivElement>(null);

  const getStatusIcon = () => {
    switch (transactionState) {
      case 'search':
        return <Search className="h-3 w-3 animate-pulse" />;
      case 'validating':
        return <ShieldCheck className="h-3 w-3 animate-bounce" />;
      case 'confirmed':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'wallet-connecting':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      default:
        return <Wallet className="h-3 w-3" />;
    }
  };

  const getButtonText = () => {
    switch (transactionState) {
      case 'wallet-connecting':
        return 'Connexion...';
      case 'wallet-connect':
        return '0x12...89ab';
      case 'search':
        return 'Recherche...';
      case 'validating':
        return 'Validation...';
      case 'processing':
        return 'Traitement...';
      case 'confirmed':
        return 'Confirmé !';
      default:
        return 'Connecter Wallet';
    }
  };

  const getButtonStyle = () => {
    if (transactionState === 'confirmed') return 'bg-green-500 text-white';
    if (transactionState === 'initial') return 'bg-primary text-white';
    if (transactionState === 'wallet-connecting') return 'bg-primary text-white';
    return 'bg-muted text-primary border border-input';
  };

  return (
    <div className="absolute inset-0 p-2 flex flex-col">
      <div className="relative h-12 px-3 flex items-center justify-between border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
        <div className="flex items-center">
          <img 
            src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg"
            alt="TRADECOINER"
            className="h-6 w-auto"
          />
        </div>
        
        <div className="relative">
          <AnimatePresence>
            {showWalletSpotlight && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.2 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute inset-0 bg-primary/20 rounded-full"
              />
            )}
          </AnimatePresence>
          
          <motion.button
            animate={{
              scale: showWalletSpotlight ? [1, 1.05, 1] : 1,
              y: transactionState === 'confirmed' ? [0, -2, 0] : 0
            }}
            transition={{
              duration: transactionState === 'confirmed' ? 0.3 : 1,
              repeat: showWalletSpotlight || transactionState === 'confirmed' ? Infinity : 0,
              repeatType: "reverse"
            }}
            className={`h-7 px-2.5 rounded-full whitespace-nowrap flex items-center gap-1.5 text-[10px] 
              ${getButtonStyle()} transition-colors duration-300`}
          >
            {getStatusIcon()}
            {getButtonText()}
          </motion.button>
        </div>
      </div>

      <motion.div 
        className="flex-1 flex items-center justify-center bg-gradient-to-b from-transparent via-white/50 to-gray-50/20"
        animate={{
          scale: transactionState === 'confirmed' ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
      >
        <div 
          ref={modelContainerRef} 
          className="w-[30rem] h-[30rem] relative flex items-center justify-center"
        >
          <DiamondViewer state={transactionState} />
        </div>
      </motion.div>

      {transactionState !== 'initial' && (
        <motion.div 
          className="h-0.5 bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className={`h-full ${
              transactionState === 'confirmed' ? 'bg-green-500' : 'bg-primary'
            }`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
