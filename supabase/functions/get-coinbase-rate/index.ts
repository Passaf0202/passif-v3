import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Using Coinbase Commerce API to get exchange rates
    const response = await fetch(
      'https://api.commerce.coinbase.com/v2/prices/BNB-EUR/spot',
      {
        headers: {
          'X-CC-Api-Key': coinbaseApiKey,
          'Content-Type': 'application/json',
        }
      }
    )

    if (!response.ok) {
      console.error('Coinbase API response:', await response.text())
      throw new Error(`Coinbase API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Coinbase response:', data)

    if (!data.data || !data.data.amount) {
      throw new Error('Invalid response format from Coinbase API')
    }

    // The amount field contains the current spot price
    const rate = parseFloat(data.data.amount)
    console.log('Rate found:', { fiatCurrency, rate })

    return new Response(
      JSON.stringify({ rate }),
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