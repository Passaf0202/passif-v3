import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, buyerAddress } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get listing details
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select(`
        *,
        profiles:user_id (
          wallet_address
        )
      `)
      .eq('id', listingId)
      .single();

    if (listingError) throw listingError;
    if (!listing) throw new Error('Listing not found');

    const sellerAddress = listing.profiles.wallet_address;
    if (!sellerAddress) throw new Error('Seller wallet address not found');

    // Create Zero Network payment intent
    const zeroApiKey = Deno.env.get('ZERO_API_KEY');
    if (!zeroApiKey) throw new Error('Zero API key not configured');

    const paymentData = {
      network: listing.crypto_currency === 'ETH' ? 'ethereum' : 'bitcoin',
      amount: listing.crypto_amount.toString(),
      currency: listing.crypto_currency,
      from: buyerAddress,
      to: sellerAddress,
      metadata: {
        listingId,
        title: listing.title,
      }
    };

    console.log('Creating Zero Network payment intent:', paymentData);

    const response = await fetch('https://api.zero.network/v1/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${zeroApiKey}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Zero Network API error:', error);
      throw new Error('Failed to create payment intent');
    }

    const paymentIntent = await response.json();
    console.log('Payment intent created:', paymentIntent);

    return new Response(
      JSON.stringify(paymentIntent),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});