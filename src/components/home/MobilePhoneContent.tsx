
import { motion } from "framer-motion";
import { Wallet, Loader2 } from "lucide-react";
import { DiamondViewer } from "./DiamondViewer";
import { useRef } from "react";

type TransactionState = 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  showWalletSpotlight: boolean;
}

export function MobilePhoneContent({ transactionState, showWalletSpotlight }: MobilePhoneContentProps) {
  const modelContainerRef = useRef<HTMLDivElement>(null);

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
          {showWalletSpotlight && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute inset-0 bg-primary/20 rounded-full"
            />
          )}
          <motion.button
            animate={{
              scale: showWalletSpotlight ? [1, 1.05, 1] : 1
            }}
            transition={{
              duration: 1,
              repeat: showWalletSpotlight ? Infinity : 0,
              repeatType: "reverse"
            }}
            className={`h-7 px-2.5 rounded-full whitespace-nowrap flex items-center gap-1.5 text-[10px] 
              ${transactionState === 'initial' ? 'bg-primary text-white' : 
                transactionState === 'wallet-connecting' ? 'bg-primary text-white' :
                'bg-muted text-primary border border-input'}`}
          >
            {transactionState === 'wallet-connecting' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Connexion...
              </>
            ) : transactionState === 'initial' ? (
              <>
                <Wallet className="h-3 w-3" />
                Connecter Wallet
              </>
            ) : (
              <>
                <Wallet className="h-3 w-3" />
                0x12...89ab
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-transparent via-white/50 to-gray-50/20">
        <div 
          ref={modelContainerRef} 
          className="w-80 h-80 relative flex items-center justify-center"
        >
          <DiamondViewer state={transactionState} />
        </div>
      </div>

      {transactionState !== 'initial' && (
        <div className="h-0.5 bg-gray-100">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2 }}
          />
        </div>
      )}
    </div>
  );
}
