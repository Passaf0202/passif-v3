
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json()

    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Fetching balance for wallet:', address)
    
    const zerionApiKey = Deno.env.get('ZERION_API_KEY')
    if (!zerionApiKey) {
      throw new Error('ZERION_API_KEY is not configured')
    }

    const credentials = btoa(`${zerionApiKey}:`)
    console.log('Using Basic auth with API key')

    const response = await fetch(
      `https://api.zerion.io/v1/wallets/${address}/portfolio`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${credentials}`
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Zerion API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      })
      throw new Error(`Zerion API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Zerion API response:', JSON.stringify(data, null, 2))

    const totalValue = data.data.attributes.total.positions

    return new Response(
      JSON.stringify({ total_value_usd: totalValue }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in get-wallet-balance:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
