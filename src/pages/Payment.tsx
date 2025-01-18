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

  // Fetch current ETH rate
  const { data: cryptoRates, isError } = useQuery({
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

  if (!listing) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Annonce non trouvée</p>
        </div>
      </div>
    );
  }

  // Utiliser le taux de l'API ou le taux de repli
  const ethRate = cryptoRates?.rate_eur || FALLBACK_ETH_RATE;
  const cryptoAmount = Number(listing.price) / ethRate;

  console.log('Payment details:', {
    listingPrice: listing.price,
    ethRate: ethRate,
    cryptoAmount: cryptoAmount,
    usingFallbackRate: !cryptoRates
  });

  const handlePaymentComplete = () => {
    navigate(returnUrl || `/listings/${listing.id}`);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <CryptoPaymentForm
          listingId={listing.id}
          title={listing.title}
          price={listing.price}
          cryptoAmount={cryptoAmount}
          cryptoCurrency="ETH"
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
}