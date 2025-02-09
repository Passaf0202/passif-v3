
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";
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
      
      if (!id) {
        console.error('Invalid listing ID:', id);
        throw new Error('Invalid listing ID');
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
      
      if (error) throw error;
      if (!data) throw new Error('Listing not found');
      
      console.log('Fetched listing:', data);
      return data;
    },
    enabled: !initialListing && !!id
  });

  const listing = initialListing || fetchedListing;
  const sellerWalletAddress = listing?.wallet_address || listing?.user?.wallet_address;

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isListingLoading) {
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

  if (listingError || !listing) {
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

  if (!sellerWalletAddress) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              L'adresse du vendeur est manquante. La transaction ne peut pas être effectuée.
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
        <CryptoPaymentForm
          listingId={listing.id}
          title={listing.title}
          price={listing.price}
          cryptoAmount={listing.crypto_amount}
          cryptoCurrency="BNB"
          sellerAddress={sellerWalletAddress}
          onPaymentComplete={() => {
            if (listing.id) {
              navigate(`/release-funds/${listing.id}`);
            }
          }}
        />
      </div>
    </div>
  );
}
