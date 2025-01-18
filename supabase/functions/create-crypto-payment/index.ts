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
    const { listingId, buyerAddress, sellerAddress, amount, cryptoCurrency, includeEscrowFees } = await req.json();
    console.log('Creating payment for:', { listingId, buyerAddress, amount, cryptoCurrency });

    const coinbaseApiKey = Deno.env.get('COINBASE_COMMERCE_API_KEY');
    if (!coinbaseApiKey) {
      throw new Error('Coinbase API key not configured');
    }

    // Créer le paiement via l'API Coinbase Commerce
    const chargeData = {
      name: `Payment for listing ${listingId}`,
      description: `Payment to ${sellerAddress}`,
      pricing_type: "fixed_price",
      local_price: {
        amount: amount,
        currency: cryptoCurrency
      },
      metadata: {
        listing_id: listingId,
        buyer_address: buyerAddress,
        seller_address: sellerAddress,
        include_escrow_fees: includeEscrowFees
      },
      redirect_url: `${req.headers.get('origin')}/payment/success/${listingId}`,
      cancel_url: `${req.headers.get('origin')}/payment/cancel/${listingId}`,
      payment_methods: [cryptoCurrency.toLowerCase()]
    };

    console.log('Creating Coinbase charge:', chargeData);

    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': coinbaseApiKey,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify(chargeData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Coinbase error:', errorText);
      throw new Error(`Coinbase error: ${errorText}`);
    }

    const paymentData = await response.json();
    console.log('Payment created:', paymentData);

    return new Response(
      JSON.stringify({ url: paymentData.data.hosted_url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error creating payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create payment' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});