
import { motion } from "framer-motion";
import { Wallet, CheckCircle } from "lucide-react";
import { DiamondViewer } from "./DiamondViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

type TransactionState = 'initial' | 'wallet-connect' | 'wallet-connecting' | 'payment' | 'processing' | 'confirmed';

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  showWalletSpotlight: boolean;
}

export function MobilePhoneContent({ transactionState, showWalletSpotlight }: MobilePhoneContentProps) {
  const modelContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Header simple */}
      <div className="relative h-14 px-4 flex items-center justify-between">
        <Badge variant="outline" className="h-7 flex items-center gap-1.5 text-[11px] font-medium">
          <CheckCircle className="h-3.5 w-3.5" />
          Acheteur vérifié
        </Badge>
        
        <motion.button
          animate={{
            scale: showWalletSpotlight ? [1, 1.05, 1] : 1
          }}
          transition={{
            duration: 1,
            repeat: showWalletSpotlight ? Infinity : 0,
            repeatType: "reverse"
          }}
          className="h-8 w-8 rounded-full flex items-center justify-center bg-black text-white"
        >
          <Wallet className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-[360px] mx-auto">
          {/* Section modèle 3D */}
          <div className="relative aspect-square w-full max-w-[280px] mx-auto">
            <motion.div 
              ref={modelContainerRef}
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: transactionState === 'confirmed' ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              <DiamondViewer state={transactionState} />
            </motion.div>
          </div>

          {/* Informations produit */}
          <div className="space-y-4 px-4">
            <div>
              <h2 className="text-[32px] leading-tight font-semibold text-black">Diamant 4 carats</h2>
            </div>

            <div className="w-full bg-black text-white px-4 py-3 rounded-xl text-base font-medium">
              19.25 ETH = 50.000 EUR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
