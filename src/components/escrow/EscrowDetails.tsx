
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import { useEscrowDetailsTransaction } from "./hooks/useEscrowDetailsTransaction";
import { TransactionStatus } from "./TransactionStatus";
import { EscrowActions } from "./EscrowActions";
import { EscrowAlerts } from "./EscrowAlerts";
import { CompletedTransactionDetails } from "./CompletedTransactionDetails";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DiamondViewer } from "@/components/home/DiamondViewer";
import { DiamondViewerState } from "@/components/home/types/diamond-viewer";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const { 
    transaction, 
    isLoading, 
    setIsLoading, 
    isFetching, 
    fetchTransaction 
  } = useEscrowDetailsTransaction(transactionId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [diamondState, setDiamondState] = useState<DiamondViewerState>("initial");

  useEffect(() => {
    console.log("Fetching transaction details for:", transactionId);
    fetchTransaction();
  }, [transactionId]);

  const handleReleaseFunds = async () => {
    setDiamondState("processing");
    // This will be set back to initial by the EscrowActions component
  };

  const isUserBuyer = user?.id === transaction?.buyer?.id;
  const isUserSeller = user?.id === transaction?.seller?.id;

  const formatCryptoAmount = (amount: number, symbol: string) => {
    return `${amount.toFixed(8)} ${symbol}`;
  };

  // Fonction pour ouvrir le lien vers l'explorateur blockchain
  const openBlockchainExplorer = () => {
    if (transaction?.transaction_hash) {
      window.open(`https://amoy.polygonscan.com/tx/${transaction.transaction_hash}`, '_blank');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isFetching) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-500">
              Transaction non trouvée ou en cours de traitement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (transaction.escrow_status === 'completed') {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <CompletedTransactionDetails transaction={transaction} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Détails de la transaction</h2>
            <p className="text-gray-600 mb-6">
              {isUserBuyer ? "Vous êtes l'acheteur de cette transaction" : 
              isUserSeller ? "Vous êtes le vendeur de cette transaction" : 
              "Détails de la transaction"}
            </p>
            
            <div className="mb-6">
              <EscrowAlerts 
                status={transaction.escrow_status} 
                hasConfirmed={transaction.buyer_confirmation} 
                fundsSecured={transaction.funds_secured}
                isUserBuyer={isUserBuyer}
              />
            </div>
            
            <Separator className="mb-6" />
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Article</span>
                <span className="font-semibold">{transaction.listing_title || "Article"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Statut</span>
                <span className="font-semibold">En attente</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Montant</span>
                <span className="font-semibold">
                  {transaction.amount && transaction.token_symbol ? 
                    formatCryptoAmount(transaction.amount, transaction.token_symbol) : 
                    "Montant non disponible"}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Acheteur</span>
                <span className="font-semibold">
                  {transaction.buyer?.full_name || transaction.buyer?.wallet_address?.substring(0, 6) + '...' + 
                  transaction.buyer?.wallet_address?.substring(transaction.buyer?.wallet_address.length - 4) || "Inconnu"}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Vendeur</span>
                <span className="font-semibold">
                  {transaction.seller?.full_name || transaction.seller_wallet_address?.substring(0, 6) + '...' + 
                  transaction.seller_wallet_address?.substring(transaction.seller_wallet_address.length - 4) || "Inconnu"}
                </span>
              </div>
            </div>
            
            {transaction.transaction_hash && (
              <Button 
                variant="outline" 
                className="w-full mt-6 flex items-center justify-center gap-2"
                onClick={openBlockchainExplorer}
              >
                <ExternalLink className="h-4 w-4" />
                Suivre la transaction sur Polygon
              </Button>
            )}

            {isUserBuyer && transaction.funds_secured && !transaction.buyer_confirmation && (
              <div className="mt-6">
                <EscrowActions 
                  transaction={transaction}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  onRelease={() => {
                    fetchTransaction();
                    setDiamondState("initial");
                  }}
                  transactionId={transactionId}
                  onActionStart={handleReleaseFunds}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">État du paiement</h2>
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <TransactionStatus transaction={transaction} />
              </div>
              {transaction.funds_secured && (
                <div className="h-20 w-20 flex items-center justify-center">
                  <DiamondViewer state={diamondState} scale={1.8} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
