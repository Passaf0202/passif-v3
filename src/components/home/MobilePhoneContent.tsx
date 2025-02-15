
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { LogoViewer } from "./LogoViewer";
import { Button } from "@/components/ui/button";

type TransactionState = 'initial' | 'wallet-connect' | 'wallet-connecting' | 'payment' | 'processing' | 'confirmed';

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  showWalletSpotlight: boolean;
}

export function MobilePhoneContent({ transactionState, showWalletSpotlight }: MobilePhoneContentProps) {
  const renderContent = () => {
    switch (transactionState) {
      case 'initial':
        return (
          <div className="w-full space-y-4">
            <div className="text-lg font-semibold">TRADECOINER</div>
            <div className="text-2xl font-bold">2 500 €</div>
            <div className="text-sm text-gray-600">≈ 0.92 POL</div>
            <Button 
              className="w-full mt-4 animate-pulse" 
              size="lg"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connecter Wallet
            </Button>
          </div>
        );
      
      case 'wallet-connecting':
        return (
          <div className="w-full flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        );
      
      case 'wallet-connect':
      case 'payment':
        return (
          <div className="w-full space-y-4">
            <div className="text-lg font-semibold">Paiement sécurisé</div>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Montant</span>
                <span>2 500 €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>En POL</span>
                <span>0.92 POL</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              variant={transactionState === 'payment' ? 'outline' : 'default'}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {transactionState === 'payment' ? 'Smart Contract activé' : 'Payer maintenant'}
            </Button>
          </div>
        );
      
      case 'processing':
        return (
          <div className="w-full flex items-center justify-center py-4">
            <div className="text-center space-y-2">
              <span className="text-sm text-gray-600">Transaction en cours...</span>
            </div>
          </div>
        );
      
      case 'confirmed':
        return (
          <div className="w-full space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <span className="text-green-600 font-medium">Transaction réussie</span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 p-4 flex flex-col">
      <div className="relative h-12 px-3 flex items-center justify-between border-b border-gray-200/80 bg-white/90 backdrop-blur-md mb-4">
        <div className="flex items-center">
          <img 
            src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg"
            alt="TRADECOINER"
            className="h-6 w-auto"
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

      <div className="flex-1 flex flex-col items-center justify-between relative">
        <div className="w-48 h-48 relative">
          <LogoViewer state={transactionState} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={transactionState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-white rounded-lg p-4"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {transactionState !== 'initial' && (
        <motion.div 
          className="h-1 bg-gray-100 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className={`h-full ${
              transactionState === 'confirmed' ? 'bg-green-500' : 'bg-primary'
            }`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2 }}
          />
        </motion.div>
      )}
    </div>
  );
}
