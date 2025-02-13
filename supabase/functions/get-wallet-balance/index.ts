
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
    // Vérifier si la requête est un POST
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
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
      console.error('No wallet address provided');
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
      console.error('ZERION_API_KEY not configured');
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
    console.log('Zerion API response received');

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
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
