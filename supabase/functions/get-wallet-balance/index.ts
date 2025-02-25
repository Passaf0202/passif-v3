
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Cache les données pendant 15 minutes
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

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Réduire les données avant mise en cache
    const minimalData = {
      total_value_usd: data.total_value_usd
    };

    console.log('Fresh balance data for address:', address)

    // Mettre en cache pour 15 minutes
    await setCacheData(cacheKey, minimalData, 900) // 15 minutes en secondes

    return new Response(JSON.stringify(minimalData), {
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
