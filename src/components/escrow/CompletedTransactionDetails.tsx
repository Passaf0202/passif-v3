
import { Transaction } from "./types/escrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ExternalLink, Clock, Shield, Copy, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface CompletedTransactionDetailsProps {
  transaction: Transaction;
}

export function CompletedTransactionDetails({ transaction }: CompletedTransactionDetailsProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const getExplorerUrl = () => {
    // Pour Polygon Amoy testnet
    return `https://amoy.polygonscan.com/tx/${transaction.transaction_hash}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    
    toast({
      title: "Copié !",
      description: "L'adresse a été copiée dans le presse-papier",
    });
    
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return "Date non disponible";
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
    }
  };

  // Fonction pour formater les montants
  const formatCryptoAmount = (amount: number) => {
    if (!amount) return "0";
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    }).format(amount);
  };

  // Calculer les économies réalisées (simulé pour l'exemple)
  const calculateSavings = () => {
    // Exemple: estimation à 1.5% d'économies sur une plateforme centralisée
    if (!transaction.amount) return 0;
    return transaction.amount * 0.015;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="bg-green-100 rounded-full p-4">
          <Check className="h-8 w-8 text-green-600 animate-scale-in" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl">Transaction complétée</CardTitle>
          <p className="text-center text-muted-foreground">
            Les fonds ont été libérés avec succès
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {formatDate(transaction.updated_at)}
            </Badge>
          </div>

          {transaction.listing?.images && transaction.listing.images.length > 0 && (
            <div className="w-full flex justify-center">
              <div className="h-36 w-36 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src={transaction.listing.images[0]} 
                  alt={transaction.listing_title || "Produit"}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-green-800">Récapitulatif du paiement</h3>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant transféré</span>
                <span className="font-semibold">
                  {formatCryptoAmount(transaction.amount)} {transaction.token_symbol}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Commission</span>
                <span className="font-semibold">
                  {formatCryptoAmount(transaction.commission_amount)} {transaction.token_symbol}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">
                  {formatCryptoAmount(transaction.amount + (transaction.commission_amount || 0))} {transaction.token_symbol}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-1">Économies réalisées</h4>
                <p className="text-sm text-blue-600">
                  En utilisant notre plateforme décentralisée, vous avez économisé environ{' '}
                  <span className="font-medium">{formatCryptoAmount(calculateSavings())} {transaction.token_symbol}</span>{' '}
                  par rapport aux plateformes traditionnelles.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Adresse du vendeur</h4>
            <div className="relative">
              <div className="bg-gray-50 p-3 rounded border text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {transaction.seller_wallet_address}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => copyToClipboard(transaction.seller_wallet_address || "")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {transaction.transaction_hash && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(getExplorerUrl(), '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir sur l'explorateur Polygon
              </Button>
            )}
            
            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => window.location.href = '/search'}
              >
                Continuer mes achats
              </Button>
              
              <Button
                className="flex-1 text-sm"
                onClick={() => window.location.href = '/transactions'}
              >
                Voir mes transactions
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 pt-4">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>Traitée en 2 sec</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Shield className="h-4 w-4 mr-1" />
              <span>Transaction sécurisée</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
