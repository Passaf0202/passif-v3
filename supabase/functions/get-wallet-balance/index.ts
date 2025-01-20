import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    const bscApiKey = Deno.env.get('BSC_API_KEY')
    if (!bscApiKey) {
      throw new Error('BSC_API_KEY is not configured')
    }

    console.log('Fetching balance for wallet:', address)
    
    // Appel à l'API BSCScan pour obtenir le solde
    const response = await fetch(
      `https://api-testnet.bscscan.com/api?module=account&action=balance&address=${address}&apikey=${bscApiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('BSCScan API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      })
      throw new Error(`BSCScan API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('BSCScan API response:', JSON.stringify(data, null, 2))

    // Convertir le solde de Wei en BNB
    const balanceInWei = data.result
    const balanceInBNB = parseInt(balanceInWei) / 1e18

    return new Response(
      JSON.stringify({ balance: balanceInBNB }),
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