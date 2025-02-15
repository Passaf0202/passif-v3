
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle, ArrowRight } from "lucide-react";
import { DiamondViewer } from "./DiamondViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRef } from "react";

type TransactionState = 'initial' | 'wallet-connect' | 'wallet-connecting' | 'payment' | 'processing' | 'confirmed';

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  showWalletSpotlight: boolean;
}

export function MobilePhoneContent({ transactionState, showWalletSpotlight }: MobilePhoneContentProps) {
  const modelContainerRef = useRef<HTMLDivElement>(null);

  const getStatusText = () => {
    switch (transactionState) {
      case 'wallet-connecting':
        return 'Connexion...';
      case 'wallet-connect':
        return '0x12...89ab';
      case 'payment':
        return 'Payer avec ETH';
      case 'processing':
        return 'Traitement...';
      case 'confirmed':
        return 'Transaction confirmée';
      default:
        return 'Payer';
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Header avec badge acheteur vérifié */}
      <div className="relative h-14 px-4 flex items-center justify-between">
        <Badge 
          variant="outline" 
          className="h-8 px-3 flex items-center gap-1.5 text-sm font-medium border-2 border-gray-200"
        >
          <CheckCircle className="h-4 w-4" />
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
      <div className="flex-1 flex flex-col px-4">
        {/* Section modèle 3D */}
        <div className="relative aspect-square w-full max-w-[320px] mx-auto bg-gradient-to-b from-gray-50 to-white mb-8">
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
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-black">
              Diamant 4 carats
            </h2>

            <Button 
              variant="default"
              className="w-full justify-start bg-black hover:bg-black/90 text-base font-medium py-6"
            >
              19.25 ETH = 50.000 EUR
            </Button>
          </div>

          {/* Séparateurs gris simulant le contenu */}
          <div className="space-y-4 py-4">
            <Separator className="bg-gray-200 h-3 rounded" />
            <Separator className="bg-gray-200 h-3 rounded" />
            <Separator className="bg-gray-200 h-3 rounded" />
            <Separator className="bg-gray-200 h-3 rounded" />
          </div>

          <Button 
            size="lg"
            className={`w-full ${
              transactionState === 'confirmed' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-black hover:bg-black/90'
            } text-white py-6 text-base font-medium transition-colors duration-300`}
          >
            {getStatusText()}
            {transactionState === 'initial' && <ArrowRight className="h-5 w-5 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Barre de progression */}
      {transactionState !== 'initial' && (
        <motion.div 
          className="h-0.5 bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className={`h-full ${
              transactionState === 'confirmed' ? 'bg-green-500' : 'bg-black'
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
