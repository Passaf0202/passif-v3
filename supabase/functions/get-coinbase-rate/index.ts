import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Starting get-coinbase-rate function...")

// Taux de repli pour les principales cryptomonnaies (en EUR)
const FALLBACK_RATES = {
  BNB: 250,  // 1 BNB ≈ 250 EUR
  ETH: 2500, // 1 ETH ≈ 2500 EUR
  BTC: 40000 // 1 BTC ≈ 40000 EUR
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cryptoCurrency = 'BNB', fiatCurrency = 'EUR' } = await req.json()
    console.log(`Fetching rate for ${cryptoCurrency}/${fiatCurrency}`)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Récupérer le taux depuis la base de données
    const { data: rates, error: dbError } = await supabaseClient
      .from('crypto_rates')
      .select('*')
      .eq('symbol', cryptoCurrency)
      .eq('is_active', true)
      .maybeSingle()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to fetch rates from database')
    }

    let rate: number

    if (rates) {
      console.log('Found rates in database:', rates)
      switch (fiatCurrency) {
        case 'USD':
          rate = rates.rate_usd
          break
        case 'GBP':
          rate = rates.rate_gbp
          break
        default: // EUR
          rate = rates.rate_eur
          break
      }
    } else {
      console.log('No rates found in database, using fallback rate')
      rate = FALLBACK_RATES[cryptoCurrency as keyof typeof FALLBACK_RATES] || 250
    }

    console.log(`Using rate: ${rate} ${fiatCurrency} per ${cryptoCurrency}`)
    
    return new Response(
      JSON.stringify({ rate }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in get-coinbase-rate:', error)
    
    // En cas d'erreur, utiliser le taux de repli
    const fallbackRate = FALLBACK_RATES.BNB
    console.log(`Error occurred, using fallback rate: ${fallbackRate} EUR`)
    
    return new Response(
      JSON.stringify({
        rate: fallbackRate
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Retourner 200 même en cas d'erreur car nous fournissons un taux de repli
      }
    )
  }
})