
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Transaction } from "@/components/escrow/types/escrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Loader2, ExternalLink, AlertTriangle } from "lucide-react";
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

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'awaiting-payment' | 'completed'>('all');
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
              price,
              user_id
            )
          `)
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Enrichir les transactions avec les rôles (acheteur/vendeur)
        const enrichedData = data?.map(transaction => ({
          ...transaction,
          isUserBuyer: transaction.buyer_id === user.id,
          isUserSeller: transaction.seller_id === user.id || transaction.listing?.user_id === user.id
        })) || [];
        
        setTransactions(enrichedData);
        setFilteredTransactions(enrichedData);
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
      // Transactions où l'utilisateur est acheteur et doit libérer des fonds
      // OU si l'utilisateur est vendeur et attend la libération des fonds
      setFilteredTransactions(transactions.filter(t => 
        t.escrow_status === 'pending' && 
        t.funds_secured && 
        !t.buyer_confirmation
      ));
    } else if (activeFilter === 'awaiting-payment') {
      // Transactions où l'utilisateur est vendeur et attend un paiement
      setFilteredTransactions(transactions.filter(t => 
        t.isUserSeller && 
        t.escrow_status === 'pending' && 
        !t.funds_secured
      ));
    } else if (activeFilter === 'completed') {
      setFilteredTransactions(transactions.filter(t => t.status === 'completed'));
    }
  }, [activeFilter, transactions]);

  // Helper pour traduire les statuts
  const getStatusTranslation = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      'pending': { label: 'En attente', color: 'bg-yellow-500' },
      'completed': { label: 'Terminée', color: 'bg-green-500' },
      'cancelled': { label: 'Annulée', color: 'bg-red-500' },
      'dispute': { label: 'Litige', color: 'bg-orange-500' },
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-500' };
  };

  // Helper pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  // Fonction pour déterminer si une transaction est "à libérer"
  const isReleaseRequired = (transaction: Transaction) => {
    return (
      transaction.escrow_status === 'pending' &&
      transaction.funds_secured &&
      !transaction.buyer_confirmation
    );
  };

  // Fonction pour déterminer si une transaction est "en attente de paiement"
  const isAwaitingPayment = (transaction: Transaction) => {
    return (
      transaction.isUserSeller &&
      transaction.escrow_status === 'pending' &&
      !transaction.funds_secured
    );
  };

  // Générer le titre de l'état d'attente
  const getAwaitingStatusMessage = (transaction: Transaction) => {
    if (isReleaseRequired(transaction)) {
      return "En attente de libération des fonds";
    }
    if (isAwaitingPayment(transaction)) {
      return "En attente de paiement de l'acheteur";
    }
    return null;
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
            variant={activeFilter === 'awaiting-payment' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('awaiting-payment')}
            className="rounded-full"
          >
            Attente paiement
          </Button>
          <Button 
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('completed')}
            className="rounded-full"
          >
            Terminées
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
                    : activeFilter === 'awaiting-payment'
                      ? "Vous n'avez pas de transaction en attente de paiement"
                      : "Vous n'avez pas de transaction terminée"}
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
                const status = getStatusTranslation(transaction.status);
                const imageUrl = transaction.listing?.images?.[0];
                const awaitingMessage = getAwaitingStatusMessage(transaction);
                const userRole = transaction.isUserBuyer ? "Acheteur" : "Vendeur";
                
                return (
                  <Card key={transaction.id} className="overflow-hidden">
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
                        </div>
                        
                        {/* Détails */}
                        <div className="p-6 flex-1">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">
                                {transaction.listing?.title || "Article sans nom"}
                              </h3>
                              <div className="text-sm text-muted-foreground mb-2">
                                <span>Transaction du {formatDate(transaction.created_at)}</span>
                                <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full">{userRole}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <Badge className={`${status.color} text-white`}>
                                  {status.label}
                                </Badge>
                                <div className="text-sm font-medium">
                                  {formatCryptoAmount(transaction.amount, transaction.token_symbol)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-auto">
                            {awaitingMessage && (
                              <p className={`text-sm font-medium ${
                                isReleaseRequired(transaction) ? 'text-amber-600' : 
                                isAwaitingPayment(transaction) ? 'text-blue-600' : ''
                              }`}>
                                {awaitingMessage}
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
                              
                              {transaction.escrow_status === 'pending' && transaction.can_be_cancelled && (
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
