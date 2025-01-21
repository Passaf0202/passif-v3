import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";
import { EscrowDetails } from "@/components/escrow/EscrowDetails";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Payment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialListing = location.state?.listing;
  const returnUrl = location.state?.returnUrl;

  // Fetch listing data
  const { 
    data: fetchedListing, 
    isLoading: isListingLoading,
    error: listingError 
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (initialListing) {
        console.log('Using initial listing:', initialListing);
        return initialListing;
      }
      
      console.log('Fetching listing with ID:', id);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            id,
            wallet_address,
            avatar_url,
            full_name
          )
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching listing:', error);
        throw error;
      }
      if (!data) {
        console.log('No listing found with ID:', id);
        throw new Error('Listing not found');
      }
      console.log('Fetched listing:', data);
      return data;
    },
    enabled: !initialListing && !!id,
    retry: false
  });

  // Fetch crypto rates
  const { data: cryptoRates, isLoading: isRatesLoading } = useQuery({
    queryKey: ['crypto-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_rates')
        .select('*')
        .eq('symbol', 'BNB')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching BNB rate:', error);
        return null;
      }
      console.log('Fetched crypto rates:', data);
      return data;
    }
  });

  // Fetch transaction data
  const { data: transaction } = useQuery({
    queryKey: ['transaction', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('listing_id', id)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching transaction:', error);
        return null;
      }
      
      console.log('Latest transaction:', data);
      return data;
    },
    enabled: !!id && !!user?.id
  });

  const currentListing = initialListing || fetchedListing;

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isListingLoading || isRatesLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (listingError || !currentListing) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Cette annonce n'existe pas ou n'est plus disponible
            </AlertDescription>
          </Alert>
          <Button onClick={handleBackToHome} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Veuillez vous connecter pour accéder à cette page
            </AlertDescription>
          </Alert>
          <Button onClick={handleBackToHome} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {transaction ? (
          <EscrowDetails transactionId={transaction.id} />
        ) : (
          <CryptoPaymentForm
            listingId={currentListing.id}
            title={currentListing.title}
            price={currentListing.price}
            cryptoAmount={currentListing.crypto_amount}
            cryptoCurrency="BNB"
            onPaymentComplete={() => navigate(returnUrl || `/listings/${currentListing.id}`)}
          />
        )}
      </div>
    </div>
  );
}