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
    
    if (!listingId || !buyerAddress) {
      throw new Error('Paramètres manquants: listingId et buyerAddress sont requis')
    }

    // Vérifier les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const coinbaseApiKey = Deno.env.get('COINBASE_COMMERCE_API_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Variables d\'environnement Supabase manquantes')
      throw new Error('Configuration Supabase incomplète')
    }

    if (!coinbaseApiKey) {
      console.error('Clé API Coinbase Commerce manquante')
      throw new Error('COINBASE_COMMERCE_API_KEY non configurée')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Récupérer les détails de l'annonce avec les informations du vendeur
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select(`
        *,
        seller:profiles!listings_user_id_fkey (
          id,
          wallet_address
        )
      `)
      .eq('id', listingId)
      .maybeSingle()

    if (listingError) {
      console.error('Erreur lors de la récupération de l\'annonce:', listingError)
      throw new Error('Erreur lors de la récupération de l\'annonce')
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

    // Créer une charge Coinbase Commerce
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': coinbaseApiKey,
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
          seller_address: listing.seller.wallet_address
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

    if (!chargeData.data?.code) {
      console.error('Réponse Coinbase invalide:', chargeData)
      throw new Error('Code de charge invalide reçu de Coinbase')
    }

    // Créer la transaction dans la base de données
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: buyerAddress,
        seller_id: listing.user_id,
        amount: listing.price,
        commission_amount: listing.price * 0.05, // 5% de commission
        status: 'pending',
        escrow_status: 'pending',
        network: listing.crypto_currency || 'eth',
        token_symbol: listing.crypto_currency || 'eth',
        transaction_hash: chargeData.data.code,
        smart_contract_address: chargeData.data.addresses?.[listing.crypto_currency?.toLowerCase() || 'eth'],
        chain_id: 1 // Ethereum mainnet par défaut
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