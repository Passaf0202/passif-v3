import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionState } from "../home/HeroSection";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";

interface MobilePhoneContentProps {
  transactionState: TransactionState;
  onStateChange: (state: TransactionState) => void;
}

export function MobilePhoneContent({ transactionState, onStateChange }: MobilePhoneContentProps) {
  const [walletConnected, setWalletConnected] = useState(false);

  const handleConnectWallet = () => {
    setWalletConnected(true);
    onStateChange('wallet-connecting');

    setTimeout(() => {
      onStateChange('payment');
    }, 2000);
  };

  const handlePay = () => {
    onStateChange('processing');

    setTimeout(() => {
      onStateChange('awaiting-confirmation');
    }, 2000);

    setTimeout(() => {
      onStateChange('confirmed');
    }, 4000);
  };

  const handleTransactionComplete = () => {
    setWalletConnected(false);
    onStateChange('initial');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {transactionState === 'initial' && (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Connectez votre wallet pour effectuer une transaction.
          </p>
          <Button onClick={handleConnectWallet} className="w-full">
            <Wallet className="mr-2 h-4 w-4" />
            Connecter un wallet
          </Button>
        </div>
      )}

      {transactionState === 'wallet-connecting' && (
        <div className="space-y-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">
            Connexion au wallet...
          </p>
        </div>
      )}

      {transactionState === 'payment' && (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Prêt à effectuer le paiement ?
          </p>
          <Button onClick={handlePay} className="w-full">
            Payer maintenant
          </Button>
        </div>
      )}

      {transactionState === 'processing' && (
        <div className="space-y-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">
            Traitement du paiement...
          </p>
        </div>
      )}

      {transactionState === 'awaiting-confirmation' && (
        <div className="space-y-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">
            En attente de confirmation...
          </p>
        </div>
      )}

      {transactionState === 'confirmed' && (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" />
          <p className="text-sm text-gray-600">
            Transaction terminée !
          </p>
          <Button className="transaction-button" onClick={handleTransactionComplete}>Transaction terminée</Button>
        </div>
      )}
    </div>
  );
}
