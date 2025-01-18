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
    const { listingId, buyerAddress, sellerAddress, amount, cryptoCurrency } = await req.json()
    console.log('Creating payment for:', { listingId, buyerAddress, sellerAddress, amount, cryptoCurrency })
    
    if (!listingId || !buyerAddress || !sellerAddress) {
      console.error('Missing required parameters:', { listingId, buyerAddress, sellerAddress })
      throw new Error('Missing required parameters')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      throw new Error('Server configuration error')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Fetch listing details
    console.log('Fetching listing details for ID:', listingId)
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select(`
        *,
        user:profiles!listings_user_id_fkey (
          id,
          wallet_address
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
        network: listing.crypto_currency?.toLowerCase() || 'bnb',
        token_symbol: listing.crypto_currency?.toLowerCase() || 'bnb',
        chain_id: 56 // BSC Mainnet
      })

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      throw new Error('Error creating transaction record')
    }

    // Préparer les données pour le paiement direct
    const paymentData = {
      from: buyerAddress,
      to: sellerAddress,
      value: listing.crypto_amount?.toString() || '0',
      chainId: 56,
      currency: listing.crypto_currency || 'BNB'
    }

    console.log('Payment data prepared:', paymentData)

    return new Response(
      JSON.stringify(paymentData),
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})