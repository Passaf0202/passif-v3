
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { address } = await req.json()
    if (!address) {
      throw new Error('Address is required')
    }

    // Cache les données pendant 5 minutes
    const cacheKey = `balance:${address}`
    const cachedData = await getCachedData(cacheKey)
    if (cachedData) {
      console.log('Returning cached balance for address:', address)
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Si pas de cache, obtenir les nouvelles données
    const response = await fetch(
      `https://api.zerion.io/v1/wallets/${address}/portfolio?currency=usd`,
      {
        headers: {
          accept: 'application/json',
          authorization: `Basic ${Deno.env.get('ZERION_API_KEY')}`,
        },
      }
    )

    const data = await response.json()
    console.log('Fresh balance data for address:', address)

    // Mettre en cache pour 5 minutes
    await setCacheData(cacheKey, data, 300)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Fonctions de cache KV
async function getCachedData(key: string) {
  const kv = await Deno.openKv()
  const result = await kv.get(['cache', key])
  await kv.close()
  
  if (!result.value) return null
  
  const { data, expiry } = result.value
  if (Date.now() > expiry) {
    // Cache expired
    const kv = await Deno.openKv()
    await kv.delete(['cache', key])
    await kv.close()
    return null
  }
  
  return data
}

async function setCacheData(key: string, data: any, ttl: number) {
  const kv = await Deno.openKv()
  const expiry = Date.now() + (ttl * 1000)
  await kv.set(['cache', key], { data, expiry })
  await kv.close()
}
