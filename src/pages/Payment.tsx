import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Taux de repli si l'API ne répond pas (1 BNB = 250 EUR)
const FALLBACK_BNB_RATE = 250;

export default function Payment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const listing = location.state?.listing;
  const returnUrl = location.state?.returnUrl;

  // Fetch listing if not provided in location state
  const { data: fetchedListing, isLoading: isListingLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (listing) return listing;
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !listing && !!id
  });

  // Fetch current BNB rate
  const { data: cryptoRates, isLoading: isRatesLoading } = useQuery({
    queryKey: ['crypto-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_rates')
        .select('*')
        .eq('symbol', 'BNB')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching BNB rate:', error);
        return null;
      }
      return data;
    }
  });

  const currentListing = listing || fetchedListing;
  
  if (isListingLoading || isRatesLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentListing) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Annonce non trouvée</p>
        </div>
      </div>
    );
  }

  // Calculate crypto amount
  const bnbRate = cryptoRates?.rate_eur || FALLBACK_BNB_RATE;
  const cryptoAmount = Number(currentListing.price) / bnbRate;

  console.log('Payment details:', {
    listingPrice: currentListing.price,
    bnbRate,
    cryptoAmount,
    usingFallbackRate: !cryptoRates
  });

  const handlePaymentComplete = () => {
    navigate(returnUrl || `/listings/${currentListing.id}`);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <CryptoPaymentForm
          listingId={currentListing.id}
          title={currentListing.title}
          price={currentListing.price}
          cryptoAmount={cryptoAmount}
          cryptoCurrency="BNB"
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
}