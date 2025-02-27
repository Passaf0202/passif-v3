
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Transaction } from "@/components/escrow/types/escrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Loader2, ExternalLink } from "lucide-react";

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
            )
          `)
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

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

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      <PageHeader title="Mes Transactions" diamondScale={2} />
      
      <div className="container max-w-4xl mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Vous n'avez pas encore de transaction</h3>
            <p className="text-muted-foreground mb-6">Achetez un article pour voir vos transactions ici</p>
            <Button onClick={() => navigate('/')}>Parcourir les annonces</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const status = getStatusTranslation(transaction.status);
              const isBuyer = transaction.buyer?.id === user?.id;
              const imageUrl = transaction.listing?.images?.[0];
              
              return (
                <Card key={transaction.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="w-full md:w-48 h-48 md:h-auto overflow-hidden bg-muted flex-shrink-0">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={transaction.listing_title || "Image de l'article"}
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
                              {transaction.listing_title || "Article sans nom"}
                            </h3>
                            <div className="text-sm text-muted-foreground mb-2">
                              <span>Transaction du {formatDate(transaction.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                              <Badge className={`${status.color} text-white`}>
                                {status.label}
                              </Badge>
                              <div className="text-sm font-medium">
                                {transaction.amount} {transaction.token_symbol}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          {transaction.escrow_status === 'pending' && (
                            <p className="text-sm text-amber-600 font-medium">
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
                                onClick={() => window.open(`https://polygonscan.com/tx/${transaction.transaction_hash}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Voir sur Polygonscan
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
  );
}
