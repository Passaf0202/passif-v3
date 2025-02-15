
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle, ArrowRight } from "lucide-react";
import { DiamondViewer } from "./DiamondViewer";
import { Card, CardContent } from "@/components/ui/card";
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
        return 'Connecter wallet';
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Header minimaliste */}
      <div className="relative h-14 px-4 flex items-center justify-between border-b border-gray-100">
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

      {/* Contenu principal centré */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[360px] mx-auto">
          <Card className="overflow-hidden bg-white border-0 shadow-none">
            {/* Section modèle 3D centrée */}
            <div className="relative aspect-square w-full max-w-[320px] mx-auto bg-gradient-to-b from-gray-50 to-white">
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

            {/* Section informations produit */}
            <CardContent className="px-6 py-5 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-black">Diamant 4 carats</h2>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    Édition Limitée
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Achat Sécurisé
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <div className="space-y-0.5">
                  <div className="text-2xl font-bold">2.5 ETH</div>
                  <div className="text-sm text-gray-500">≈ 4 800 €</div>
                </div>

                <Button 
                  size="lg"
                  className={`${
                    transactionState === 'confirmed' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-black hover:bg-black/90'
                  } text-white px-6 gap-2 transition-colors duration-300`}
                >
                  {getStatusText()}
                  {transactionState === 'initial' && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
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
