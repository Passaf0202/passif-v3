import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Fetch current rates from CoinGecko Pro API for multiple tokens
    const tokens = ['matic-network', 'tether', 'usd-coin'];
    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/simple/price?ids=${tokens.join(',')}&vs_currencies=usd,eur,gbp`,
      {
        headers: {
          'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') || '',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('CoinGecko response:', data)

    // Update rates for each token
    const updates = [
      {
        symbol: 'MATIC',
        name: 'Polygon',
        rates: data['matic-network']
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        rates: data['tether']
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        rates: data['usd-coin']
      }
    ];

    for (const update of updates) {
      const { error: updateError } = await supabaseClient
        .from('crypto_rates')
        .upsert({
          symbol: update.symbol,
          name: update.name,
          rate_usd: update.rates.usd,
          rate_eur: update.rates.eur,
          rate_gbp: update.rates.gbp,
          last_updated: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'symbol'
        })

      if (updateError) {
        console.error(`Error updating ${update.symbol} rates:`, updateError)
      }
    }

    return new Response(
      JSON.stringify({ success: true, rates: data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error updating rates:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})