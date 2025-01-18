import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Taux de repli si l'API ne répond pas (1 ETH = 2500 EUR)
const FALLBACK_ETH_RATE = 2500;

export default function Payment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const listing = location.state?.listing;
  const returnUrl = location.state?.returnUrl;

  // Fetch listing if not provided in location state
  const { data: fetchedListing } = useQuery({
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

  const currentListing = listing || fetchedListing;

  // Fetch current ETH rate
  const { data: cryptoRates } = useQuery({
    queryKey: ['crypto-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_rates')
        .select('*')
        .eq('symbol', 'ETH')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

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

  // Calculate crypto amount if not already set
  if (!currentListing.crypto_amount) {
    const ethRate = cryptoRates?.rate_eur || FALLBACK_ETH_RATE;
    currentListing.crypto_amount = Number(currentListing.price) / ethRate;
  }

  console.log('Payment details:', {
    listingPrice: currentListing.price,
    ethRate: cryptoRates?.rate_eur || FALLBACK_ETH_RATE,
    cryptoAmount: currentListing.crypto_amount,
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
          cryptoAmount={currentListing.crypto_amount}
          cryptoCurrency="ETH"
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
}