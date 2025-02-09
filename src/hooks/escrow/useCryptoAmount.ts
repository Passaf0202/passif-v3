
import { supabase } from "@/integrations/supabase/client";
import type { CryptoRate } from "@/hooks/useCryptoRates";

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
    .eq('symbol', 'BNB')
    .eq('is_active', true)
    .maybeSingle();

  if (rateError || !cryptoRate) {
    console.error('Error fetching BNB rate:', rateError);
    throw new Error("Impossible de récupérer le taux de conversion BNB");
  }

  const rate = cryptoRate as CryptoRate;

  if (!rate.rate_eur || rate.rate_eur <= 0) {
    console.error('Invalid BNB rate:', rate.rate_eur);
    throw new Error("Taux de conversion BNB invalide");
  }

  const cryptoAmount = Number(listing.price) / rate.rate_eur;
  
  if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
    console.error('Invalid crypto amount calculated:', {
      price: listing.price,
      rate: rate.rate_eur,
      result: cryptoAmount
    });
    throw new Error("Erreur lors du calcul du montant en crypto");
  }

  const { error: updateError } = await supabase
    .from('listings')
    .update({
      crypto_amount: cryptoAmount,
      crypto_currency: 'BNB'
    })
    .eq('id', listing.id);

  if (updateError) {
    console.error('Error updating listing with crypto amount:', updateError);
    throw new Error("Erreur lors de la mise à jour du montant en crypto");
  }

  return {
    ...listing,
    crypto_amount: cryptoAmount,
    crypto_currency: 'BNB'
  };
};
