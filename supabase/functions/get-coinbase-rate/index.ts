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

    // Utilisation de l'API Coinbase Commerce v3 pour les taux de change
    const response = await fetch(
      `https://api.commerce.coinbase.com/rates/${cryptoCurrency}-${fiatCurrency}`,
      {
        headers: {
          'X-CC-Api-Key': coinbaseApiKey,
          'X-CC-Version': '2018-03-22',
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('Coinbase API response:', await response.text())
      throw new Error(`Coinbase API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Coinbase response:', data)

    return new Response(
      JSON.stringify({ rate: parseFloat(data.data.rate) }),
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