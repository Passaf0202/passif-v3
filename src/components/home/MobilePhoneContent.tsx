
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

export function MobilePhoneContent({
  transactionState,
  showWalletSpotlight
}: MobilePhoneContentProps) {
  const modelContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Header simple */}
      <div className="relative h-12 px-4 flex items-center justify-end">
        <motion.button
          animate={{
            scale: showWalletSpotlight ? [1, 1.05, 1] : 1
          }}
          transition={{
            duration: 1,
            repeat: showWalletSpotlight ? Infinity : 0,
            repeatType: "reverse"
          }}
          className="h-6 w-6 rounded-full flex items-center justify-center bg-black text-white"
        >
          <Wallet className="h-3 w-3" />
        </motion.button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col relative">
        <div className="w-full max-w-[360px] mx-auto px-4">
          {/* Section modèle 3D */}
          <div className="h-[160px] w-full relative">
            <motion.div 
              ref={modelContainerRef}
              className="w-full h-full"
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
          <div className="space-y-2 -mt-8">
            <Badge 
              variant="outline" 
              className="h-4 inline-flex items-center gap-1 text-[9px] font-medium border-gray-200/80 whitespace-nowrap px-2"
            >
              <CheckCircle className="h-2.5 w-2.5" />
              Acheteur vérifié
            </Badge>

            <div>
              <h2 className="text-lg leading-tight font-semibold text-black">Diamant 4 carats</h2>
            </div>

            <div className="w-full h-8 bg-black text-white rounded-full px-3 flex items-center justify-center text-xs font-medium whitespace-nowrap transition-colors duration-200">
              19.25 ETH = 50.000 EUR
            </div>

            <div className="w-full h-[1px] bg-gray-200/80 my-2" />

            <div className="space-y-2">
              <Button 
                variant="default"
                size="sm"
                className="w-full h-8 bg-primary/90 hover:bg-primary/80 text-white rounded-full px-3 text-sm transition-colors duration-200"
              >
                Payer
              </Button>
              
              <div className="space-y-1.5">
                <div className="w-full h-[1px] bg-gray-200/80" />
                <div className="w-full h-[1px] bg-gray-200/80" />
                <div className="w-full h-[1px] bg-gray-200/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
