import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { listingId, buyerAddress } = await req.json()
    console.log('Received request with:', { listingId, buyerAddress })
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer les détails de l'annonce
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*, user:profiles!listings_user_id_fkey(*)')
      .eq('id', listingId)
      .maybeSingle()

    if (listingError) {
      console.error('Erreur lors de la récupération de l\'annonce:', listingError)
      throw new Error('Annonce non trouvée')
    }

    if (!listing) {
      console.error('Annonce non trouvée:', listingId)
      throw new Error('Annonce non trouvée')
    }

    console.log('Listing found:', listing)

    // Créer une charge Coinbase Commerce
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': Deno.env.get('COINBASE_COMMERCE_API_KEY') ?? '',
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify({
        name: listing.title,
        description: listing.description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: listing.price.toString(),
          currency: 'EUR'
        },
        metadata: {
          listing_id: listingId,
          buyer_address: buyerAddress,
          seller_id: listing.user_id
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur Coinbase:', errorText)
      throw new Error(`Erreur Coinbase: ${errorText}`)
    }

    const chargeData = await response.json()
    console.log('Charge created:', chargeData)

    // Créer une transaction dans la base de données
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: buyerAddress,
        seller_id: listing.user_id,
        amount: listing.price,
        status: 'pending',
        commission_amount: listing.price * 0.05, // 5% de commission
      })

    if (transactionError) {
      console.error('Erreur lors de la création de la transaction:', transactionError)
      throw new Error('Erreur lors de la création de la transaction')
    }

    return new Response(
      JSON.stringify(chargeData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Erreur inattendue:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Une erreur inattendue est survenue' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})