import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

console.log("Starting get-coinbase-rate function...")

// Taux de repli pour les principales cryptomonnaies (en EUR)
const FALLBACK_RATES = {
  BNB: 250,
  ETH: 2000,
  BTC: 40000,
  SOL: 90
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cryptoCurrency = 'BNB', fiatCurrency = 'EUR' } = await req.json()
    console.log(`Fetching rate for ${cryptoCurrency}/${fiatCurrency}`)

    // Tentative de récupération via CoinGecko
    try {
      const coingeckoIds = {
        BNB: 'binancecoin',
        ETH: 'ethereum',
        BTC: 'bitcoin',
        SOL: 'solana'
      }

      const id = coingeckoIds[cryptoCurrency as keyof typeof coingeckoIds]
      if (!id) throw new Error('Unsupported cryptocurrency')

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${fiatCurrency.toLowerCase()}`
      )

      if (!response.ok) throw new Error('CoinGecko API error')

      const data = await response.json()
      const rate = data[id][fiatCurrency.toLowerCase()]

      console.log(`CoinGecko rate for ${cryptoCurrency}: ${rate} ${fiatCurrency}`)
      
      // Mettre à jour le taux dans la base de données
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          auth: {
            persistSession: false
          }
        }
      )

      const { error: updateError } = await supabaseClient
        .from('crypto_rates')
        .upsert({
          symbol: cryptoCurrency,
          name: cryptoCurrency,
          [`rate_${fiatCurrency.toLowerCase()}`]: rate,
          last_updated: new Date().toISOString()
        })

      if (updateError) {
        console.error('Error updating rate in database:', updateError)
      }

      return new Response(
        JSON.stringify({ rate }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (apiError) {
      console.error('CoinGecko API error:', apiError)
      
      // En cas d'erreur de l'API, essayer de récupérer le dernier taux connu de la base de données
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          auth: {
            persistSession: false
          }
        }
      )

      const { data: rates, error: dbError } = await supabaseClient
        .from('crypto_rates')
        .select('*')
        .eq('symbol', cryptoCurrency)
        .eq('is_active', true)
        .maybeSingle()

      if (!dbError && rates) {
        const rate = fiatCurrency === 'USD' ? rates.rate_usd :
                    fiatCurrency === 'GBP' ? rates.rate_gbp :
                    rates.rate_eur

        console.log(`Using database rate: ${rate} ${fiatCurrency}`)
        return new Response(
          JSON.stringify({ rate }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      // Si aucun taux n'est disponible, utiliser le taux de repli
      const fallbackRate = FALLBACK_RATES[cryptoCurrency as keyof typeof FALLBACK_RATES]
      console.log(`Using fallback rate: ${fallbackRate} ${fiatCurrency}`)
      
      return new Response(
        JSON.stringify({ rate: fallbackRate }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
  } catch (error) {
    console.error('Error in get-coinbase-rate:', error)
    return new Response(
      JSON.stringify({
        error: `Internal Server Error: ${error.message}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})