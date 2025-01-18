import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Starting get-coinbase-rate function...")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    console.log('Fetching BNB rate from database...')
    const { data: rates, error: dbError } = await supabaseClient
      .from('crypto_rates')
      .select('*')
      .eq('symbol', 'BNB')
      .eq('is_active', true)
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to fetch rates from database')
    }

    if (!rates) {
      console.log('No rates found, using fallback rate')
      // Fallback rate if no data is found
      return new Response(
        JSON.stringify({
          data: {
            currency: 'BNB',
            rates: {
              EUR: 250, // Fallback rate
            }
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log('Successfully retrieved rates:', rates)
    return new Response(
      JSON.stringify({
        data: {
          currency: 'BNB',
          rates: {
            EUR: rates.rate_eur,
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

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