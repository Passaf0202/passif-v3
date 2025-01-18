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
    console.log('Creating payment for:', { listingId, buyerAddress })
    
    if (!listingId || !buyerAddress) {
      throw new Error('Missing required parameters: listingId and buyerAddress')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const coinbaseApiKey = Deno.env.get('COINBASE_COMMERCE_API_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      throw new Error('Server configuration error')
    }

    if (!coinbaseApiKey) {
      console.error('Missing Coinbase API key')
      throw new Error('Server configuration error')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Fetch listing with seller details
    console.log('Fetching listing details...')
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select(`
        *,
        user:profiles!listings_user_id_fkey (
          id,
          wallet_address,
          full_name,
          email
        )
      `)
      .eq('id', listingId)
      .maybeSingle()

    if (listingError) {
      console.error('Error fetching listing:', listingError)
      throw new Error('Error retrieving listing details')
    }

    if (!listing) {
      console.error('Listing not found:', listingId)
      throw new Error('Listing not found')
    }

    console.log('Listing found:', listing)

    if (!listing.user?.wallet_address) {
      console.error('Seller has not connected their wallet')
      throw new Error('Le vendeur n\'a pas connecté son portefeuille')
    }

    // Build absolute URLs for redirection
    const baseUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
    const successUrl = new URL(`/payment/success/${listingId}`, baseUrl).toString()
    const cancelUrl = new URL(`/payment/cancel/${listingId}`, baseUrl).toString()

    console.log('Redirect URLs:', { successUrl, cancelUrl })

    // Create Coinbase charge
    const chargeData = {
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
        seller_address: listing.user.wallet_address,
        customer_id: buyerAddress,
        order_id: listingId
      },
      redirect_url: successUrl,
      cancel_url: cancelUrl
    }

    // Add payment method if specified
    if (listing.crypto_currency) {
      chargeData['payment_methods'] = [listing.crypto_currency.toLowerCase()]
    }

    console.log('Creating Coinbase charge:', chargeData)

    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': coinbaseApiKey,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify(chargeData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Coinbase error:', errorText)
      throw new Error(`Coinbase error: ${errorText}`)
    }

    const responseData = await response.json()
    console.log('Coinbase response:', responseData)

    if (!responseData.data?.hosted_url) {
      console.error('Invalid Coinbase response:', responseData)
      throw new Error('Invalid response from Coinbase')
    }

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: buyerAddress,
        seller_id: listing.user_id,
        amount: listing.price,
        commission_amount: listing.price * 0.05,
        status: 'pending',
        escrow_status: 'pending',
        network: listing.crypto_currency?.toLowerCase() || 'eth',
        token_symbol: listing.crypto_currency?.toLowerCase() || 'eth',
        transaction_hash: responseData.data.code,
        smart_contract_address: responseData.data.addresses?.[listing.crypto_currency?.toLowerCase() || 'eth'],
        chain_id: 1
      })

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      throw new Error('Error creating transaction record')
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
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