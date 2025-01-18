import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, buyerAddress } = await req.json();
    console.log('Creating payment for listing:', listingId, 'buyer:', buyerAddress);

    if (!listingId || !buyerAddress) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      throw new Error('Failed to fetch listing details');
    }

    if (!listing) {
      throw new Error('Listing not found');
    }

    console.log('Listing details:', listing);

    const merchantKey = Deno.env.get('CRYPTOMUS_MERCHANT_KEY');
    const paymentKey = Deno.env.get('CRYPTOMUS_PAYMENT_KEY');

    if (!merchantKey || !paymentKey) {
      console.error('Cryptomus API keys not configured');
      throw new Error('Payment service configuration missing');
    }

    // Create signature for Cryptomus API
    const payload = {
      merchant_id: merchantKey,
      amount: listing.crypto_amount.toString(),
      currency: listing.crypto_currency,
      network: listing.crypto_currency?.toLowerCase() || "tron",
      order_id: `${listingId}-${Date.now()}`,
      from_currency: "EUR",
      to_currency: listing.crypto_currency,
      url_callback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-crypto-payment`,
      is_payment_multiple: false,
      lifetime: "24",
      additional_data: {
        listing_id: listingId,
        buyer_address: buyerAddress,
        seller_address: listing.profiles.wallet_address
      }
    };

    console.log('Creating Cryptomus payment with payload:', payload);

    // Create payment via Cryptomus API
    const response = await fetch('https://api.cryptomus.com/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant': merchantKey,
        'sign': await createSignature(payload, paymentKey)
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cryptomus API error response:', errorText);
      throw new Error(`Cryptomus API error: ${errorText}`);
    }

    const paymentData = await response.json();
    console.log('Payment created:', paymentData);

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: buyerAddress,
        seller_id: listing.user_id,
        amount: listing.crypto_amount,
        commission_amount: listing.crypto_amount * 0.05, // 5% commission
        status: 'pending',
        network: listing.crypto_currency,
        token_symbol: listing.crypto_currency
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      throw new Error('Failed to record transaction');
    }

    return new Response(
      JSON.stringify(paymentData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create payment' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function createSignature(payload: any, paymentKey: string): Promise<string> {
  const encodedPayload = btoa(JSON.stringify(payload));
  const encoder = new TextEncoder();
  const data = encoder.encode(encodedPayload);
  const key = encoder.encode(paymentKey);
  const hashBuffer = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  ).then(key => crypto.subtle.sign(
    'HMAC',
    key,
    data
  ));
  
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}