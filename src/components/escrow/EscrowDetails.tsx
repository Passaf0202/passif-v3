
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, ShieldCheck, Lock, ExternalLink } from "lucide-react";
import { useEscrowDetailsTransaction } from "./hooks/useEscrowDetailsTransaction";
import { TransactionStatus } from "./TransactionStatus";
import { EscrowActions } from "./EscrowActions";
import { EscrowInformation } from "./EscrowInformation";
import { CompletedTransactionDetails } from "./CompletedTransactionDetails";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DiamondViewer } from "@/components/home/DiamondViewer";
import { DiamondViewerState } from "@/components/home/types/diamond-viewer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [diamondState, setDiamondState] = useState<DiamondViewerState>("initial");
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log("Fetching transaction details for:", transactionId);
    fetchTransaction();
  }, [transactionId]);

  const handleReleaseFunds = async () => {
    setDiamondState("processing");
    // This will be set back to initial by the EscrowActions component
  };

  const renderErrorMessage = () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUUID = uuidPattern.test(transactionId);

    if (isUUID) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La transaction est en cours de traitement. Si vous venez de la créer, 
            veuillez patienter quelques instants puis rafraîchir la page.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Transaction introuvable. Veuillez vérifier l'identifiant de la transaction.
        </AlertDescription>
      </Alert>
    );
  };

  const handleBack = () => {
    navigate('/');
  };

  // Fonction pour ouvrir le lien vers l'explorateur blockchain
  const openBlockchainExplorer = () => {
    if (transaction?.transaction_hash) {
      window.open(`https://amoy.polygonscan.com/tx/${transaction.transaction_hash}`, '_blank');
    }
  };

  // Fonction pour formater le montant en crypto avec seulement 3 décimales
  const formatCryptoAmount = (amount: number, symbol: string) => {
    // Convertir en chaîne et limiter à 3 décimales
    const amountStr = amount.toString();
    const parts = amountStr.split('.');
    
    if (parts.length === 2 && parts[1].length > 3) {
      return `${parts[0]}.${parts[1].substring(0, 3)}... ${symbol}`;
    }
    
    return `${amount} ${symbol}`;
  };

  if (isFetching) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Card className={isMobile ? "shadow-md rounded-lg" : ""}>
          <CardHeader>
            <CardTitle>Confirmer la réception du produit</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Card className={isMobile ? "shadow-md rounded-lg" : ""}>
          <CardHeader>
            <CardTitle>Confirmer la réception du produit</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {renderErrorMessage()}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si la transaction est complétée, afficher les détails de complétion
  if (transaction.escrow_status === 'completed') {
    return (
      <div className="max-w-3xl mx-auto">
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

  // Interface normale pour les transactions actives
  return (
    <div className="max-w-3xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Confirmer la réception du produit</h1>
      </div>
      
      <Card className={`w-full ${isMobile ? "shadow-md rounded-lg" : ""}`}>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between space-x-4">
            {/* Image à gauche */}
            <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden shadow-sm">
              {transaction.listing?.images && transaction.listing.images.length > 0 ? (
                <img 
                  src={transaction.listing.images[0]} 
                  alt={transaction.listing_title || "Product"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img 
                  src="/placeholder.svg" 
                  alt="Product"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            
            {/* Détails au milieu */}
            <div className="flex-grow">
              <h3 className="text-xl font-semibold">{transaction.listing_title || "Article"}</h3>
              <div className="flex items-baseline gap-4 mt-1">
                <p className="text-2xl font-bold">
                  {transaction.amount && transaction.token_symbol ? 
                    formatCryptoAmount(transaction.amount, transaction.token_symbol) : 
                    "Montant non disponible"}
                </p>
              </div>
            </div>
            
            {/* Diamant 3D à droite */}
            <div className="h-20 w-20 flex items-center justify-center">
              <DiamondViewer state={diamondState} scale={1.8} />
            </div>
          </div>

          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Détails de l'article</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Article</span>
                <span className="font-medium">{transaction.listing_title || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-medium">
                  {transaction.amount && transaction.token_symbol ? 
                    formatCryptoAmount(transaction.amount, transaction.token_symbol) : 
                    "Montant non disponible"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">État</span>
                <span className="font-medium">
                  Fonds envoyés
                </span>
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              <strong>Attention :</strong> Une fois les fonds libérés au vendeur, il sera très difficile d'obtenir un remboursement. 
              Assurez-vous d'avoir bien vérifié le produit et qu'il correspond à vos attentes avant de libérer les fonds.
            </AlertDescription>
          </Alert>

          {/* Bouton pour suivre la transaction */}
          {transaction.transaction_hash && (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 rounded-md py-5 h-auto"
              onClick={openBlockchainExplorer}
            >
              <ExternalLink className="h-4 w-4" />
              Suivre la transaction sur Polygon
            </Button>
          )}

          <Separator />
          
          <div className="space-y-5">
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
          
          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-center gap-8">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                  <ShieldCheck className="h-4 w-4" />
                  Protection acheteur
                </button>
              </DialogTrigger>
              <DialogContent className={`${isMobile ? "max-w-[350px]" : "sm:max-w-md"} rounded-lg`}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold mb-4">Protection acheteur</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Politique de remboursement</h4>
                    <p className="text-gray-600 mb-2">
                      Tu peux obtenir un remboursement si ta commande :
                    </p>
                    <ul className="list-disc ml-5 text-gray-600">
                      <li>est perdue ou n'est jamais livrée</li>
                      <li>arrive endommagée</li>
                      <li>n'est pas du tout conforme à sa description</li>
                    </ul>
                    <p className="text-gray-600 mt-2">
                      Tu disposes de 2 jours pour soumettre une réclamation à compter du moment où la livraison de la commande t'est notifiée, même si l'article n'a jamais été livré.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                  <Lock className="h-4 w-4" />
                  Paiement sécurisé
                </button>
              </DialogTrigger>
              <DialogContent className={`${isMobile ? "max-w-[350px]" : "sm:max-w-md"} rounded-lg`}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold mb-4">Smart Contract</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <p className="text-gray-600">
                    Notre technologie de smart contract garantit que votre paiement reste sécurisé jusqu'à ce que:
                  </p>
                  <ul className="list-disc ml-5 text-gray-600">
                    <li>Vous confirmiez la réception du produit</li>
                    <li>Le délai de protection acheteur expire (30 jours)</li>
                    <li>Un médiateur résout un litige éventuel</li>
                  </ul>
                  <p className="text-gray-600">
                    Les fonds ne sont jamais directement accessibles au vendeur avant ces conditions.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            En libérant les fonds, vous confirmez avoir reçu l'article et être satisfait de votre achat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
