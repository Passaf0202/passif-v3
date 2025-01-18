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
    console.log('Creating payment for listing:', listingId, 'buyer:', buyerAddress);

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

    const merchantKey = Deno.env.get('CRYPTOMUS_MERCHANT_KEY');
    const paymentKey = Deno.env.get('CRYPTOMUS_PAYMENT_KEY');

    if (!merchantKey || !paymentKey) {
      throw new Error('Cryptomus API keys not configured');
    }

    // Créer la signature pour l'API Cryptomus
    const payload = {
      merchant_id: merchantKey,
      amount: listing.price.toString(),
      currency: "EUR",
      order_id: `${listingId}-${Date.now()}`,
      network: listing.crypto_currency?.toLowerCase() || "tron",
      url_callback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-crypto-payment`,
      url_return: `${req.headers.get('origin')}/listings/${listingId}`,
      is_payment_multiple: false,
      lifetime: "24", // Durée de validité du paiement en heures
      to_currency: listing.crypto_currency || "USDT",
      additional_data: {
        listing_id: listingId,
        buyer_address: buyerAddress,
        seller_address: listing.profiles.wallet_address
      }
    };

    console.log('Creating Cryptomus payment with payload:', payload);

    // Appel à l'API Cryptomus pour créer le paiement
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
      const error = await response.text();
      console.error('Cryptomus API error:', error);
      throw new Error('Failed to create payment');
    }

    const paymentData = await response.json();
    console.log('Payment created:', paymentData);

    // Créer l'enregistrement de transaction dans la base de données
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: buyerAddress,
        amount: listing.price,
        commission_amount: listing.price * 0.05, // 5% de commission
        status: 'pending',
        network: listing.crypto_currency || "USDT",
        token_symbol: listing.crypto_currency || "USDT"
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      throw transactionError;
    }

    return new Response(
      JSON.stringify(paymentData),
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

// Fonction utilitaire pour créer la signature Cryptomus
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