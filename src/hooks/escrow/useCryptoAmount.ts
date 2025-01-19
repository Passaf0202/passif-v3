import { supabase } from "@/integrations/supabase/client";

export const validateAndUpdateCryptoAmount = async (listing: any) => {
  console.log('Validating crypto amount for listing:', listing);
  
  // Si le montant en crypto est déjà valide, on le retourne
  if (listing.crypto_amount && 
      typeof listing.crypto_amount === 'number' && 
      listing.crypto_amount > 0) {
    console.log('Crypto amount is already valid:', listing.crypto_amount);
    return listing;
  }

  // Récupérer le taux BNB actuel
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

  if (!cryptoRate.rate_eur || cryptoRate.rate_eur <= 0) {
    console.error('Invalid BNB rate:', cryptoRate.rate_eur);
    throw new Error("Taux de conversion BNB invalide");
  }

  const cryptoAmount = Number(listing.price) / cryptoRate.rate_eur;
  console.log('Calculated crypto amount:', {
    price: listing.price,
    rate: cryptoRate.rate_eur,
    amount: cryptoAmount
  });

  if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
    console.error('Invalid crypto amount calculated:', {
      price: listing.price,
      rate: cryptoRate.rate_eur,
      result: cryptoAmount
    });
    throw new Error("Erreur lors du calcul du montant en crypto");
  }

  // Mettre à jour l'annonce avec le montant calculé
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