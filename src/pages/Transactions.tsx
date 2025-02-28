
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Transaction } from "@/components/escrow/types/escrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Loader2, ExternalLink, AlertTriangle, Ban, Clock, CheckCircle2 } from "lucide-react";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from "@/components/escrow/types/escrow";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [isCancelling, setIsCancelling] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState<Transaction | null>(null);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            listing:listings!transactions_listing_id_fkey (
              title,
              images,
              price
            ),
            buyer:profiles!transactions_buyer_id_fkey (
              id,
              full_name,
              username
            ),
            seller:profiles!transactions_seller_id_fkey (
              id,
              full_name,
              username
            )
          `)
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setTransactions(data || []);
        setFilteredTransactions(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  useEffect(() => {
    // Appliquer le filtre sélectionné
    if (activeFilter === 'all') {
      setFilteredTransactions(transactions);
    } else if (activeFilter === 'pending') {
      setFilteredTransactions(transactions.filter(t => t.escrow_status === 'pending' && t.funds_secured));
    } else if (activeFilter === 'completed') {
      setFilteredTransactions(transactions.filter(t => t.status === 'completed'));
    } else if (activeFilter === 'cancelled') {
      setFilteredTransactions(transactions.filter(t => t.status === 'cancelled'));
    }
  }, [activeFilter, transactions]);

  // Helper pour traduire les statuts
  const getStatusBadge = (transaction: Transaction) => {
    const { status, escrow_status, funds_secured } = transaction;
    
    if (status === 'cancelled' || escrow_status === 'cancelled') {
      return (
        <Badge className="flex items-center gap-1 bg-red-100 text-red-800 border-red-200 hover:bg-red-200">
          <Ban className="h-3 w-3" />
          Annulée
        </Badge>
      );
    }
    
    if (status === 'completed' || escrow_status === 'completed') {
      return (
        <Badge className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
          <CheckCircle2 className="h-3 w-3" />
          Terminée
        </Badge>
      );
    }
    
    if (escrow_status === 'pending') {
      if (funds_secured) {
        return (
          <Badge className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
            <Clock className="h-3 w-3" />
            En attente de confirmation
          </Badge>
        );
      } else {
        return (
          <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
            <Clock className="h-3 w-3" />
            En attente de paiement
          </Badge>
        );
      }
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  // Helper pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
  };

  // Fonction pour formater le montant en crypto en limitant les décimales
  const formatCryptoAmount = (amount: number, symbol: string) => {
    const amountStr = amount.toString();
    const decimalIndex = amountStr.indexOf('.');
    
    if (decimalIndex !== -1 && amountStr.length > decimalIndex + 3) {
      // Limiter à 2 décimales et ajouter "..."
      return `${amountStr.substring(0, decimalIndex + 3)}... ${symbol}`;
    }
    
    return `${amount} ${symbol}`;
  };

  const handleCancelTransaction = async () => {
    if (!transactionToCancel || !transactionToCancel.blockchain_txn_id) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler cette transaction",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCancelling(true);

      // 1. Vérifier et changer de réseau si nécessaire
      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 2. Initialiser le provider et le signer
      let provider;
      if (typeof window !== 'undefined' && window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        throw new Error("Provider non disponible");
      }
      
      const signer = provider.getSigner();
      
      // 3. Initialiser le contrat
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      const txnId = Number(transactionToCancel.blockchain_txn_id);
      
      // 4. Estimer le gaz
      const gasEstimate = await contract.estimateGas.cancelTransaction(txnId);
      const gasLimit = gasEstimate.mul(120).div(100); // +20% marge
      
      // 5. Envoyer la transaction d'annulation
      const tx = await contract.cancelTransaction(txnId, { gasLimit });
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        // 6. Mise à jour de la base de données
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'cancelled',
            escrow_status: 'cancelled',
            cancellation_reason: 'Annulée par l\'utilisateur',
            cancelled_at: now,
            cancelled_by: user?.id,
            can_be_cancelled: false,
            updated_at: now
          })
          .eq('id', transactionToCancel.id);

        if (updateError) throw updateError;

        // 7. Mettre à jour l'état local
        setTransactions(prev => 
          prev.map(t => 
            t.id === transactionToCancel.id
              ? { 
                  ...t, 
                  status: 'cancelled', 
                  escrow_status: 'cancelled',
                  cancelled_at: now,
                  cancelled_by: user?.id,
                  can_be_cancelled: false
                }
              : t
          )
        );

        toast({
          title: "Succès",
          description: "La transaction a été annulée avec succès",
        });
      } else {
        throw new Error("L'annulation de la transaction a échoué sur la blockchain");
      }
    } catch (error: any) {
      console.error('[Transaction] Error cancelling transaction:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'annulation",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setTransactionToCancel(null);
    }
  };

  const canCancelTransaction = (transaction: Transaction) => {
    return (
      transaction.escrow_status === 'pending' &&
      transaction.can_be_cancelled &&
      (user?.id === transaction.buyer?.id || user?.id === transaction.seller?.id)
    );
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      <div className="container max-w-4xl mt-8 pt-4">
        <h1 className="text-3xl font-bold text-center mb-8">Mes Transactions</h1>
      
        {/* Filtres */}
        <div className="flex justify-center mb-6 gap-2">
          <Button 
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
            className="rounded-full"
          >
            Toutes
          </Button>
          <Button 
            variant={activeFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('pending')}
            className="rounded-full"
          >
            À libérer
          </Button>
          <Button 
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('completed')}
            className="rounded-full"
          >
            Terminées
          </Button>
          <Button 
            variant={activeFilter === 'cancelled' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('cancelled')}
            className="rounded-full"
          >
            Annulées
          </Button>
        </div>
      
        <div className="container max-w-4xl">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">
                {activeFilter === 'all' 
                  ? "Vous n'avez pas encore de transaction" 
                  : activeFilter === 'pending' 
                    ? "Vous n'avez pas de transaction à libérer" 
                    : activeFilter === 'completed'
                      ? "Vous n'avez pas de transaction terminée"
                      : "Vous n'avez pas de transaction annulée"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {activeFilter === 'all' 
                  ? "Achetez un article pour voir vos transactions ici" 
                  : "Changez de filtre pour voir d'autres transactions"}
              </p>
              {activeFilter === 'all' && (
                <Button onClick={() => navigate('/')}>Parcourir les annonces</Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const imageUrl = transaction.listing?.images?.[0];
                
                return (
                  <Card key={transaction.id} className="overflow-hidden border border-gray-200 hover:border-primary/50 transition-colors">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="w-full md:w-48 h-48 md:h-auto overflow-hidden bg-muted flex-shrink-0">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={transaction.listing?.title || "Image de l'article"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              Pas d'image
                            </div>
                          )}
                          
                          {/* Statut superposé sur l'image en mobile */}
                          <div className="md:hidden absolute top-3 left-3">
                            {getStatusBadge(transaction)}
                          </div>
                        </div>
                        
                        {/* Détails */}
                        <div className="p-6 flex-1">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold">
                                  {transaction.listing?.title || "Article sans nom"}
                                </h3>
                                <div className="hidden md:block">
                                  {getStatusBadge(transaction)}
                                </div>
                              </div>
                              
                              <div className="text-sm text-muted-foreground mb-2">
                                <span>Transaction du {formatDate(transaction.created_at)}</span>
                                {transaction.cancelled_at && (
                                  <span className="ml-2 text-red-500">
                                    • Annulée le {formatDate(transaction.cancelled_at)}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 mb-4">
                                <div className="text-sm font-medium">
                                  {formatCryptoAmount(transaction.amount, transaction.token_symbol)}
                                </div>
                              </div>
                              
                              {/* Détails utilisateur */}
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
                                <div className="text-gray-500">Acheteur:</div>
                                <div className="font-medium">{transaction.buyer?.username || "Inconnu"}</div>
                                
                                <div className="text-gray-500">Vendeur:</div>
                                <div className="font-medium">{transaction.seller?.username || "Inconnu"}</div>
                                
                                {transaction.blockchain_txn_id && (
                                  <>
                                    <div className="text-gray-500">ID Blockchain:</div>
                                    <div className="font-mono text-xs">{transaction.blockchain_txn_id}</div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-auto">
                            {transaction.escrow_status === 'pending' && transaction.funds_secured && (
                              <p className="text-sm text-amber-600 font-medium flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                En attente de libération des fonds
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Button 
                                onClick={() => navigate(`/payment/${transaction.id}`)}
                                variant="default"
                                className="flex-1 sm:flex-none"
                              >
                                Voir les détails
                              </Button>
                              
                              {transaction.transaction_hash && (
                                <Button 
                                  variant="outline"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => window.open(`https://amoy.polygonscan.com/tx/${transaction.transaction_hash}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Voir sur Polygonscan
                                </Button>
                              )}
                              
                              {canCancelTransaction(transaction) && (
                                <Button 
                                  variant="destructive"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => setTransactionToCancel(transaction)}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Annuler
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmation pour l'annulation */}
      <AlertDialog open={!!transactionToCancel} onOpenChange={(open) => !open && setTransactionToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette transaction ? Cette action est irréversible et les fonds seront retournés à l'acheteur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelTransaction();
              }}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Annulation en cours...
                </>
              ) : (
                "Confirmer l'annulation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
