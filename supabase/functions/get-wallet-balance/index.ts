
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const credentials = btoa(`${zerionApiKey}:`)
    console.log('Making request to Zerion API');

    try {
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
        
        return new Response(
          JSON.stringify({ 
            error: `Zerion API error: ${response.status} ${response.statusText}`,
            details: errorData
          }),
          { 
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const data = await response.json()
      console.log('Zerion API response received successfully');

      const totalValue = data.data.attributes.total.positions

      return new Response(
        JSON.stringify({ total_value_usd: totalValue }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } catch (fetchError) {
      console.error('Error fetching from Zerion API:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch wallet data from Zerion API',
          details: fetchError.message
        }),
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error in get-wallet-balance:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
