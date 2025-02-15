
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle2, ShieldCheck, Diamond, Shield } from "lucide-react";
import { LazyDiamondScene } from "./LazyDiamondScene";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TransactionState = 'initial' | 'payment' | 'confirmed';

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  showWalletSpotlight: boolean;
}

export function MobilePhoneContent({ transactionState, showWalletSpotlight }: MobilePhoneContentProps) {
  const getDiamondState = (state: TransactionState): 'initial' | 'wallet-connect' | 'wallet-connecting' | 'payment' | 'processing' | 'confirmed' => {
    switch (state) {
      case 'initial':
        return 'initial';
      case 'payment':
        return 'payment';
      case 'confirmed':
        return 'confirmed';
      default:
        return 'initial';
    }
  };

  const renderContent = () => {
    switch (transactionState) {
      case 'initial':
        return (
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Diamant Tradecoiner</h1>
                <Badge variant="outline" className="font-medium">
                  Édition limitée
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Pièce unique - Collection exclusive
              </p>
            </div>

            <div className="flex flex-col space-y-1.5">
              <div className="text-2xl font-bold">2 500 €</div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Diamond className="h-4 w-4" />
                <span>≈ 0.92 POL</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 py-2 px-3 bg-primary/5 rounded-lg">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Protection acheteur garantie</span>
            </div>

            <Button 
              className="w-full mt-2" 
              size="lg"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connecter pour acheter
            </Button>
          </div>
        );
      
      case 'payment':
        return (
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Achat sécurisé</h2>
              <div className="text-sm text-gray-600">Diamant Tradecoiner - Édition limitée</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Prix du produit</span>
                <span className="font-bold">2 500 €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Équivalent en POL</span>
                <span>0.92 POL</span>
              </div>
              <div className="flex justify-between text-sm text-primary border-t pt-2">
                <span className="flex items-center">
                  <Shield className="h-4 w-4 mr-1.5" />
                  Protection acheteur
                </span>
                <span>Incluse</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Payer via Smart Contract
            </Button>
          </div>
        );
      
      case 'confirmed':
        return (
          <div className="w-full space-y-4">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-lg font-medium text-green-600">Achat réussi !</span>
              <div className="space-y-2 text-center">
                <p className="font-medium">Le produit est réservé pour vous</p>
                <p className="text-sm text-gray-600">
                  Transaction sécurisée par<br />Smart Contract Tradecoiner
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Header */}
      <div className="relative h-12 px-3 flex items-center justify-between border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
        <div className="flex items-center">
          <img 
            src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg"
            alt="TRADECOINER"
            className="h-5 w-auto opacity-75"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {transactionState !== 'initial' && (
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
              0x1234...5678
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between p-4">
        {/* Product Viewer */}
        <div className="relative pb-4 -mt-6">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          <div className="w-64 h-64 mx-auto">
            <LazyDiamondScene state={getDiamondState(transactionState)} />
          </div>
        </div>

        {/* Transaction Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={transactionState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-white rounded-lg"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      {transactionState !== 'initial' && (
        <motion.div 
          className="h-1 bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className={`h-full ${
              transactionState === 'confirmed' ? 'bg-green-500' : 'bg-primary'
            }`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: transactionState === 'payment' ? 7 : 2 }}
          />
        </motion.div>
      )}
    </div>
  );
}
