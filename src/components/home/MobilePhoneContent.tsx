
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
      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-[360px] mx-auto">
          {/* Badge acheteur vérifié */}
          <div className="flex justify-center mb-2">
            <Badge variant="outline" className="h-5 flex items-center gap-1 text-[10px] font-medium border-gray-200">
              <CheckCircle className="h-3 w-3" />
              Acheteur vérifié
            </Badge>
          </div>

          {/* Section modèle 3D */}
          <div className="h-[280px] w-[280px] mx-auto mb-4">
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
          <div className="space-y-3 px-4">
            <div>
              <h2 className="text-2xl leading-tight font-semibold text-black">Diamant 4 carats</h2>
            </div>

            <div className="w-full bg-black text-white px-3 py-2 rounded-lg text-sm font-medium">
              19.25 ETH = 50.000 EUR
            </div>

            <div className="space-y-2 pt-1">
              <Button 
                variant="default"
                size="sm"
                className="w-full bg-black hover:bg-black/90 text-white text-sm"
              >
                Payer
              </Button>
              <div className="w-full h-[1px] bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
