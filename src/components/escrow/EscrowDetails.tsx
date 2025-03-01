
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, ExternalLink, ShieldAlert, Hash, Calendar, CreditCard, User, AlertTriangle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terminée</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
              Détails de la transaction
            </CardTitle>
            {isUserBuyer ? (
              <p className="text-sm text-blue-600 font-medium">Vous êtes l'acheteur de cette transaction</p>
            ) : isUserSeller ? (
              <p className="text-sm text-indigo-600 font-medium">Vous êtes le vendeur de cette transaction</p>
            ) : null}
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="mb-6">
              <EscrowAlerts 
                status={transaction.escrow_status} 
                hasConfirmed={transaction.buyer_confirmation} 
                fundsSecured={transaction.funds_secured}
                isUserBuyer={isUserBuyer}
              />
            </div>
            
            {isUserBuyer && transaction.funds_secured && !transaction.buyer_confirmation && (
              <Alert className="mb-6 border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Important : Vérifiez avant de confirmer</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Une fois les fonds libérés, il sera très difficile de les récupérer. 
                  Assurez-vous d'avoir bien vérifié le produit et qu'il correspond à vos attentes 
                  avant de confirmer la transaction.
                </AlertDescription>
              </Alert>
            )}
            
            <Separator className="mb-6" />
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Hash className="h-4 w-4" />
                  <span>ID Transaction</span>
                </div>
                <div className="font-mono text-sm truncate">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">{transaction.id}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="font-mono text-xs">{transaction.id}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Date de création</span>
                </div>
                <div>{formatDate(transaction.created_at)}</div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Statut</span>
                </div>
                <div>{getStatusBadge(transaction.status)}</div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Montant</span>
                </div>
                <div className="font-semibold">
                  {transaction.amount && transaction.token_symbol ? 
                    formatCryptoAmount(transaction.amount, transaction.token_symbol) : 
                    "Montant non disponible"}
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Acheteur</span>
                </div>
                <div className="font-semibold">
                  {transaction.buyer?.full_name || transaction.buyer?.wallet_address?.substring(0, 6) + '...' + 
                  transaction.buyer?.wallet_address?.substring(transaction.buyer?.wallet_address.length - 4) || "Inconnu"}
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Vendeur</span>
                </div>
                <div className="font-semibold">
                  {transaction.seller?.full_name || transaction.seller_wallet_address?.substring(0, 6) + '...' + 
                  transaction.seller_wallet_address?.substring(transaction.seller_wallet_address.length - 4) || "Inconnu"}
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Article</span>
                </div>
                <div className="font-semibold">{transaction.listing_title || "Article"}</div>
              </div>
              
              {transaction.blockchain_txn_id && (
                <div className="mt-2 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash className="h-4 w-4" />
                      <span>ID Blockchain</span>
                    </div>
                    <div className="font-mono text-sm">{transaction.blockchain_txn_id}</div>
                  </div>
                </div>
              )}
              
              {transaction.transaction_hash && (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash className="h-4 w-4" />
                      <span>Hash de transaction</span>
                    </div>
                    <div className="font-mono text-sm truncate max-w-[150px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{transaction.transaction_hash.substring(0, 10)}...</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="font-mono text-xs">{transaction.transaction_hash}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-50 px-6 py-4">
            {transaction.transaction_hash && (
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={openBlockchainExplorer}
              >
                <ExternalLink className="h-4 w-4" />
                Suivre la transaction sur Polygon
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle className="flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5 text-blue-600" />
              État du paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex-1 w-full">
                <TransactionStatus transaction={transaction} />
              </div>
              {transaction.funds_secured && (
                <div className="h-24 w-24 flex items-center justify-center">
                  <DiamondViewer state={diamondState} scale={1.8} />
                </div>
              )}
            </div>
            
            {isUserBuyer && transaction.funds_secured && !transaction.buyer_confirmation && (
              <div className="mt-6 product-received-confirmation">
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
          
          {transaction.listing?.images && transaction.listing.images.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-sm font-medium mb-2">Image de l'article</p>
              <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={transaction.listing.images[0]} 
                  alt={transaction.listing_title || "Image de l'article"} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
