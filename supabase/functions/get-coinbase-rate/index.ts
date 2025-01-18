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
    console.log('Making request to Coinbase API...')
    const response = await fetch(
      'https://api.commerce.coinbase.com/v2/exchange-rates',
      {
        headers: {
          'X-CC-Api-Key': coinbaseApiKey,
          'X-CC-Version': '2018-03-22',
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

    // Extract the specific rate we need
    const rates = data.data?.rates
    if (!rates) {
      console.error('No rates found in response:', data)
      throw new Error('No rates found in Coinbase API response')
    }

    // For BNB/EUR conversion
    const bnbToUsd = 1 / parseFloat(rates['BNB']) // Convert BNB to USD first
    const usdToEur = parseFloat(rates['EUR'])     // Then USD to EUR
    const rate = bnbToUsd * usdToEur              // Final BNB to EUR rate

    console.log('Calculated rate:', {
      bnbToUsd,
      usdToEur,
      finalRate: rate
    })

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