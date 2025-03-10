
import { supabase } from "@/integrations/supabase/client";

export const validateAndUpdateCryptoAmount = async (listing: any) => {
  console.log('Validating crypto amount for listing:', listing);
  
  if (listing.crypto_amount && 
      typeof listing.crypto_amount === 'number' && 
      listing.crypto_amount > 0) {
    console.log('Crypto amount is already valid:', listing.crypto_amount);
    return listing;
  }

  const { data: cryptoRate, error: rateError } = await supabase
    .from('crypto_rates')
    .select('*')
    .eq('symbol', 'POL')
    .eq('is_active', true)
    .maybeSingle();

  if (rateError || !cryptoRate) {
    console.error('Error fetching POL rate:', rateError);
    throw new Error("Impossible de récupérer le taux de conversion POL");
  }

  if (!cryptoRate.rate_eur || cryptoRate.rate_eur <= 0) {
    console.error('Invalid POL rate:', cryptoRate.rate_eur);
    throw new Error("Taux de conversion POL invalide");
  }

  const cryptoAmount = Number(listing.price) / cryptoRate.rate_eur;
  
  if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
    console.error('Invalid crypto amount calculated:', {
      price: listing.price,
      rate: cryptoRate.rate_eur,
      result: cryptoAmount
    });
    throw new Error("Erreur lors du calcul du montant en crypto");
  }

  const { error: updateError } = await supabase
    .from('listings')
    .update({
      crypto_amount: cryptoAmount,
      crypto_currency: 'POL'
    })
    .eq('id', listing.id);

  if (updateError) {
    console.error('Error updating listing with crypto amount:', updateError);
    throw new Error("Erreur lors de la mise à jour du montant en crypto");
  }

  return {
    ...listing,
    crypto_amount: cryptoAmount,
    crypto_currency: 'POL'
  };
};
