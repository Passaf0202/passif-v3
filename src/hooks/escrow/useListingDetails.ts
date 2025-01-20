import { supabase } from "@/integrations/supabase/client";

export async function fetchListingDetails(listingId: string) {
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select(`
      *,
      user:profiles!listings_user_id_fkey (
        wallet_address,
        id
      )
    `)
    .eq('id', listingId)
    .maybeSingle();

  if (listingError || !listing) {
    throw new Error("Impossible de récupérer les détails de l'annonce");
  }

  if (!listing.user?.wallet_address) {
    throw new Error("Le vendeur n'a pas connecté son portefeuille");
  }

  if (!listing.crypto_amount) {
    throw new Error("Le montant en crypto n'est pas défini pour cette annonce");
  }

  return listing;
}