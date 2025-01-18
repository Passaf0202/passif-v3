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
    console.log('Fetching crypto rates from CoinGecko...')
    
    const apiKey = Deno.env.get('COINGECKO_API_KEY')
    if (!apiKey) {
      throw new Error('CoinGecko API key not found')
    }
    
    // Fetch rates from CoinGecko API with Pro API key
    const response = await fetch(
      'https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,litecoin,dogecoin,tether&vs_currencies=usd,eur,gbp',
      {
        headers: {
          'x-cg-pro-api-key': apiKey
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto rates')
    }

    const data = await response.json()
    console.log('Received rates:', data)

    // Map CoinGecko response to our format
    const cryptoRates = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        rate_usd: data.bitcoin.usd,
        rate_eur: data.bitcoin.eur,
        rate_gbp: data.bitcoin.gbp
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        rate_usd: data.ethereum.usd,
        rate_eur: data.ethereum.eur,
        rate_gbp: data.ethereum.gbp
      },
      {
        symbol: 'BNB',
        name: 'BNB',
        rate_usd: data.binancecoin.usd,
        rate_eur: data.binancecoin.eur,
        rate_gbp: data.binancecoin.gbp
      },
      {
        symbol: 'LTC',
        name: 'Litecoin',
        rate_usd: data.litecoin.usd,
        rate_eur: data.litecoin.eur,
        rate_gbp: data.litecoin.gbp
      },
      {
        symbol: 'DOGE',
        name: 'Dogecoin',
        rate_usd: data.dogecoin.usd,
        rate_eur: data.dogecoin.eur,
        rate_gbp: data.dogecoin.gbp
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        rate_usd: data.tether.usd,
        rate_eur: data.tether.eur,
        rate_gbp: data.tether.gbp
      }
    ]

    // Update rates in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    for (const rate of cryptoRates) {
      const { error } = await supabase
        .from('crypto_rates')
        .upsert({
          ...rate,
          last_updated: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'symbol'
        })

      if (error) {
        console.error('Error updating rate for', rate.symbol, error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, updated: cryptoRates.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})