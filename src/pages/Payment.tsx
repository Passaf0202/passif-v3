import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";
import { EscrowDetails } from "@/components/escrow/EscrowDetails";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Taux de repli si l'API ne répond pas (1 BNB = 250 EUR)
const FALLBACK_BNB_RATE = 250;

export default function Payment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const listing = location.state?.listing;
  const returnUrl = location.state?.returnUrl;

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

  // Nouvelle query pour récupérer la transaction
  const { data: transaction } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('listing_id', id)
        .single();
      
      if (error) {
        console.log('No transaction found for this listing');
        return null;
      }
      return data;
    },
    enabled: !!id
  });

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

  // Calculate and update crypto amount if needed
  const updateCryptoAmount = async () => {
    const bnbRate = cryptoRates?.rate_eur || FALLBACK_BNB_RATE;
    const cryptoAmount = Number(currentListing.price) / bnbRate;

    console.log('Payment details:', {
      listingPrice: currentListing.price,
      bnbRate,
      cryptoAmount,
      usingFallbackRate: !cryptoRates
    });

    // Update the listing with the calculated crypto amount if it's not set
    if (!currentListing.crypto_amount) {
      const { error } = await supabase
        .from('listings')
        .update({
          crypto_amount: cryptoAmount,
          crypto_currency: 'BNB'
        })
        .eq('id', currentListing.id);

      if (error) {
        console.error('Error updating crypto amount:', error);
      } else {
        console.log('Updated crypto amount:', cryptoAmount);
        currentListing.crypto_amount = cryptoAmount;
        currentListing.crypto_currency = 'BNB';
      }
    }

    return cryptoAmount;
  };

  // Ensure crypto amount is set
  if (!currentListing.crypto_amount) {
    updateCryptoAmount();
  }

  const handlePaymentComplete = () => {
    navigate(returnUrl || `/listings/${currentListing.id}`);
  };

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
            onPaymentComplete={handlePaymentComplete}
          />
        )}
      </div>
    </div>
  );
}
