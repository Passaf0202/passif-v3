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
    console.log('Création du paiement pour:', { listingId, buyerAddress })
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer les détails de l'annonce et du vendeur
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles!listings_user_id_fkey(
          wallet_address,
          full_name
        )
      `)
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

    if (!listing.seller?.wallet_address) {
      console.error('Le vendeur n\'a pas connecté son portefeuille')
      throw new Error('Le vendeur n\'a pas connecté son portefeuille')
    }

    console.log('Annonce trouvée:', listing)

    // Construire les URLs absolues pour la redirection
    const baseUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
    const successUrl = new URL(`/payment/success/${listingId}`, baseUrl).toString()
    const cancelUrl = new URL(`/payment/cancel/${listingId}`, baseUrl).toString()

    console.log('URLs de redirection:', { successUrl, cancelUrl })

    // Créer une charge Coinbase Commerce avec escrow
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
        redirect_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          listing_id: listingId,
          buyer_address: buyerAddress,
          seller_address: listing.seller.wallet_address,
          escrow: true
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur Coinbase:', errorText)
      throw new Error(`Erreur Coinbase: ${errorText}`)
    }

    const chargeData = await response.json()
    console.log('Charge créée:', chargeData)

    // Créer une transaction avec statut escrow dans la base de données
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: buyerAddress,
        seller_id: listing.user_id,
        amount: listing.price,
        commission_amount: listing.price * 0.05, // 5% de commission
        status: 'pending',
        escrow_status: 'pending',
        network: listing.crypto_currency,
        token_symbol: listing.crypto_currency,
        chain_id: 1, // Ethereum mainnet par défaut
        transaction_hash: chargeData.data.code,
        smart_contract_address: chargeData.data.addresses?.[listing.crypto_currency?.toLowerCase() || 'eth']
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