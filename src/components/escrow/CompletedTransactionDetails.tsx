
import { Clock, Calendar, Check, ExternalLink, CreditCard, Tag, Hash, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Transaction } from "./types/escrow";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompletedTransactionDetailsProps {
  transaction: Transaction;
}

export function CompletedTransactionDetails({ transaction }: CompletedTransactionDetailsProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const formatCryptoAmount = (amount: number, symbol: string) => {
    return `${amount.toFixed(8)} ${symbol}`;
  };

  const openBlockchainExplorer = () => {
    if (transaction?.transaction_hash) {
      window.open(`https://amoy.polygonscan.com/tx/${transaction.transaction_hash}`, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-600" />
              Transaction terminée
            </CardTitle>
            <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
              Complétée
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="h-4 w-4" />
                <span>Article</span>
              </div>
              <div className="font-semibold">{transaction.listing_title}</div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="h-4 w-4" />
                <span>Montant</span>
              </div>
              <div className="font-semibold">
                {formatCryptoAmount(transaction.amount, transaction.token_symbol)}
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Date de création</span>
              </div>
              <div>{formatDate(transaction.created_at)}</div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Complétée le</span>
              </div>
              <div>{formatDate(transaction.updated_at)}</div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Acheteur</span>
              </div>
              <div className="font-semibold">
                {transaction.buyer?.username || transaction.buyer?.full_name || "Inconnu"}
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Vendeur</span>
              </div>
              <div className="font-semibold">
                {transaction.seller?.username || transaction.seller?.full_name || "Inconnu"}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Détails blockchain</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Hash className="h-4 w-4" />
                  <span>ID Transaction</span>
                </div>
                <div className="font-mono text-xs truncate">
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
                  <Hash className="h-4 w-4" />
                  <span>ID Blockchain</span>
                </div>
                <div className="font-mono text-xs">
                  {transaction.blockchain_txn_id || "N/A"}
                </div>
                
                {transaction.transaction_hash && (
                  <>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash className="h-4 w-4" />
                      <span>Hash de transaction</span>
                    </div>
                    <div className="font-mono text-xs truncate">
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
                  </>
                )}
              </div>
            </div>
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
              Voir sur Polygonscan
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résumé de la transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <div className="text-center space-y-2 mt-4">
              <h3 className="text-xl font-semibold text-green-700">Transaction réussie</h3>
              <p className="text-gray-600">
                Cette transaction a été complétée avec succès. Les fonds ont été transférés au vendeur.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {transaction.listing?.images && transaction.listing.images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Image de l'article</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={transaction.listing.images[0]} 
                  alt={transaction.listing_title || "Image de l'article"} 
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
