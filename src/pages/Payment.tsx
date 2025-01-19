import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";
import { EscrowDetails } from "@/components/escrow/EscrowDetails";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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

  const currentListing = listing || fetchedListing;

  const { data: transaction } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('listing_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.log('Error fetching transaction:', error);
        return null;
      }
      
      console.log('Latest transaction:', data);
      return data;
    },
    enabled: !!id
  });

  // Calculate and update crypto amount
  const { data: updatedListing } = useQuery({
    queryKey: ['update-crypto-amount', currentListing?.id, cryptoRates],
    queryFn: async () => {
      if (!currentListing || !cryptoRates) {
        console.log('Missing data for crypto calculation:', { currentListing, cryptoRates });
        return currentListing;
      }

      const bnbRate = cryptoRates.rate_eur;
      if (!bnbRate || bnbRate <= 0) {
        console.error('Invalid BNB rate:', bnbRate);
        throw new Error('Taux de conversion BNB invalide');
      }

      const cryptoAmount = Number(currentListing.price) / bnbRate;
      console.log('Calculated crypto amount:', {
        price: currentListing.price,
        bnbRate,
        cryptoAmount
      });

      if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
        console.error('Invalid crypto amount calculated:', cryptoAmount);
        throw new Error('Montant en crypto invalide');
      }

      // Mettre à jour l'annonce avec le montant en crypto
      const { data, error } = await supabase
        .from('listings')
        .update({
          crypto_amount: cryptoAmount,
          crypto_currency: 'BNB'
        })
        .eq('id', currentListing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating crypto amount:', error);
        throw error;
      }

      console.log('Updated listing with crypto amount:', data);
      return data;
    },
    enabled: !!currentListing && !!cryptoRates,
    retry: false
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

  const finalListing = updatedListing || currentListing;

  const handlePaymentComplete = () => {
    navigate(returnUrl || `/listings/${finalListing.id}`);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {transaction ? (
          <EscrowDetails transactionId={transaction.id} />
        ) : (
          <CryptoPaymentForm
            listingId={finalListing.id}
            title={finalListing.title}
            price={finalListing.price}
            cryptoAmount={finalListing.crypto_amount}
            cryptoCurrency="BNB"
            onPaymentComplete={handlePaymentComplete}
          />
        )}
      </div>
    </div>
  );
}