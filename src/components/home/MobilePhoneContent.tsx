
import { motion } from "framer-motion";
import { DiamondViewer } from "./DiamondViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { CheckCircle } from "lucide-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";

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
      {/* Header avec logo et wallet */}
      <div className="relative h-12 px-4 flex items-center">
        <img 
          src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Tradecoiner%20(texte).png"
          alt="Tradecoiner" 
          className="h-6 w-auto mr-auto"
        />
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
          <WalletConnectButton />
        </motion.div>
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
              variant="default" 
              className="h-4 inline-flex items-center gap-1 text-[9px] font-medium whitespace-nowrap px-2"
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
