
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "./types/escrow";
import { useCryptoRates } from "@/hooks/useCryptoRates";
import { Loader2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EscrowActions } from "./EscrowActions";
import { EscrowStatus } from "./EscrowStatus";
import { CompletedTransactionDetails } from "./CompletedTransactionDetails";
import { EscrowAlerts } from "./EscrowAlerts";
import { TransactionStatus } from "./TransactionStatus";
import { useEscrowDetailsTransaction } from "./hooks/useEscrowDetailsTransaction";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const { user } = useAuth();
  const { data: cryptoRates } = useCryptoRates();
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const {
    transaction,
    isLoading: isFetchingTransaction,
    setIsLoading,
    fetchTransaction
  } = useEscrowDetailsTransaction(transactionId);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchTransaction();
  };

  useEffect(() => {
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, refreshKey]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  // Déterminer si l'utilisateur est l'acheteur ou le vendeur
  const isUserBuyer = user?.id === transaction?.buyer?.id;
  const isUserSeller = user?.id === transaction?.seller?.id;
  const isAwaitingPayment = isUserSeller && transaction?.escrow_status === 'pending' && !transaction?.funds_secured;
  
  if (isFetchingTransaction) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des détails de la transaction...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Transaction introuvable</h3>
        <p className="text-muted-foreground">Cette transaction n'existe pas ou vous n'avez pas accès à ces détails.</p>
      </div>
    );
  }

  // Pour les transactions complétées, utiliser un composant différent
  if (transaction.escrow_status === 'completed') {
    return <CompletedTransactionDetails transaction={transaction} />;
  }

  // Pour les transactions annulées, afficher un message spécifique
  if (transaction.escrow_status === 'cancelled') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">Transaction annulée</CardTitle>
          <CardDescription className="text-center">
            Cette transaction a été annulée le {new Date(transaction.cancelled_at!).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">
              {transaction.cancellation_reason || "Cette transaction a été annulée."}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Article</span>
              <span className="font-medium">{transaction.listing_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-medium">{transaction.amount} {transaction.token_symbol}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acheteur</span>
              <span className="font-medium">{transaction.buyer?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendeur</span>
              <span className="font-medium">{transaction.seller?.full_name}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Détails de la transaction</CardTitle>
              <CardDescription>
                {isUserBuyer 
                  ? "Vous êtes l'acheteur de cette transaction" 
                  : "Vous êtes le vendeur de cette transaction"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EscrowAlerts 
                transaction={transaction}
                status={transaction.escrow_status}
                hasConfirmed={transaction.buyer_confirmation}
                fundsSecured={transaction.funds_secured}
                isUserBuyer={isUserBuyer}
              />
              
              <div className="space-y-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Article</span>
                  <span className="font-medium">{transaction.listing_title || "Article"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <TransactionStatus status={transaction.escrow_status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant</span>
                  <div className="text-right">
                    <div className="font-medium">{transaction.amount} {transaction.token_symbol}</div>
                    {cryptoRates && cryptoRates[transaction.token_symbol] && (
                      <div className="text-sm text-muted-foreground">
                        ≈ {formatCurrency(transaction.amount * cryptoRates[transaction.token_symbol].rate_eur)}
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acheteur</span>
                  <span className="font-medium">{transaction.buyer?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendeur</span>
                  <span className="font-medium">{transaction.seller?.full_name}</span>
                </div>

                {transaction.transaction_hash && (
                  <>
                    <Separator />
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="transaction-details">
                        <AccordionTrigger className="text-sm">
                          Détails blockchain
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Hash</span>
                              <span className="font-mono text-xs break-all">
                                {transaction.transaction_hash}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Block</span>
                              <span>{transaction.block_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ID</span>
                              <span>{transaction.blockchain_txn_id}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => window.open(`https://amoy.polygonscan.com/tx/${transaction.transaction_hash}`, '_blank')}
                            >
                              Voir sur Polygonscan
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">État du paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <EscrowStatus 
                transaction={transaction} 
                onRefresh={handleRefresh}
              />

              <div className="mt-6">
                {isAwaitingPayment ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-blue-800 mb-2">En attente de paiement</h3>
                    <p className="text-blue-700 text-sm">
                      L'acheteur n'a pas encore effectué le paiement. Vous serez notifié lorsque les fonds seront déposés dans l'escrow.
                    </p>
                  </div>
                ) : (
                  transaction.funds_secured && !transaction.buyer_confirmation && !transaction.seller_confirmation && isUserBuyer && (
                    <EscrowActions
                      transaction={transaction}
                      isLoading={loading}
                      setIsLoading={setIsLoading}
                      onRelease={handleRefresh}
                      transactionId={transactionId}
                    />
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
