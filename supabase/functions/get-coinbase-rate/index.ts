import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { cryptoCurrency, fiatCurrency } = await req.json()
    console.log('Fetching rate for:', { cryptoCurrency, fiatCurrency })

    const coinbaseApiKey = Deno.env.get('COINBASE_COMMERCE_API_KEY')
    if (!coinbaseApiKey) {
      throw new Error('COINBASE_COMMERCE_API_KEY is not configured')
    }

    // Appel à l'API Coinbase Commerce pour obtenir le taux
    const response = await fetch(
      `https://api.commerce.coinbase.com/v2/exchange-rates?currency=${cryptoCurrency}`,
      {
        headers: {
          'X-CC-Api-Key': coinbaseApiKey,
          'X-CC-Version': '2018-03-22'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Coinbase response:', data)

    const rate = data.data.rates[fiatCurrency]
    if (!rate) {
      throw new Error(`Rate not found for ${fiatCurrency}`)
    }

    return new Response(
      JSON.stringify({ rate: parseFloat(rate) }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in get-coinbase-rate:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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