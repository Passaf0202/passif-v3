
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle2, ShieldCheck } from "lucide-react";
import { LogoViewer } from "./LogoViewer";
import { Button } from "@/components/ui/button";

type TransactionState = 'initial' | 'payment' | 'confirmed';

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
            <div className="text-sm text-gray-600">Protection acheteur incluse</div>
            <Button 
              className="w-full mt-4 animate-pulse" 
              size="lg"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connecter votre wallet
            </Button>
          </div>
        );
      
      case 'payment':
        return (
          <div className="w-full space-y-4">
            <div className="text-lg font-semibold mb-2">Paiement sécurisé</div>
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Montant total</span>
                <span className="font-bold">2 500 €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>En POL</span>
                <span>0.92 POL</span>
              </div>
              <div className="flex justify-between text-sm text-primary">
                <span>Protection acheteur</span>
                <span>Incluse</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Payer maintenant
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
              <span className="text-lg font-medium text-green-600">Transaction réussie !</span>
              <p className="text-sm text-center text-gray-600">
                Les fonds sont sécurisés par<br />smart contract
              </p>
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
            transition={{ duration: transactionState === 'payment' ? 7 : 2 }}
          />
        </motion.div>
      )}
    </div>
  );
}
