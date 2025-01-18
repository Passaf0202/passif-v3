import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createPublicClient, createWalletClient, http } from 'npm:viem'
import { privateKeyToAccount } from 'npm:viem/accounts'
import { sepolia } from 'npm:viem/chains'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { listingId, buyerAddress, amount, currency } = await req.json()
    console.log('Processing payment for:', { listingId, buyerAddress, amount, currency })

    // Configuration du client
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    })

    const privateKey = Deno.env.get('CONTRACT_PRIVATE_KEY')
    if (!privateKey) {
      throw new Error('CONTRACT_PRIVATE_KEY not configured')
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`)
    console.log('Using account:', account.address)

    // Création de la transaction
    const txHash = await publicClient.sendTransaction({
      account,
      to: buyerAddress,
      value: BigInt(amount),
      chain: sepolia
    })

    console.log('Transaction hash:', txHash)

    return new Response(
      JSON.stringify({ 
        success: true,
        transactionHash: txHash
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Payment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})