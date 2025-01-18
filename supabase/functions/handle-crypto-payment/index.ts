import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createPublicClient, createWalletClient, http, parseEther } from 'npm:viem'
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
    const { listingId, buyerAddress, sellerAddress, amount } = await req.json()
    console.log('Processing payment for:', { listingId, buyerAddress, sellerAddress, amount })

    if (!listingId || !buyerAddress || !sellerAddress || !amount) {
      throw new Error('Missing required parameters')
    }

    const privateKey = Deno.env.get('CONTRACT_PRIVATE_KEY')
    if (!privateKey) {
      throw new Error('Contract private key not configured')
    }

    // Ensure private key starts with 0x
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
    console.log('Using escrow account with formatted private key')

    const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`)
    console.log('Using escrow account:', account.address)

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    })

    const walletClient = createWalletClient({
      chain: sepolia,
      transport: http()
    })

    // Effectuer la transaction
    const hash = await walletClient.sendTransaction({
      account,
      to: sellerAddress as `0x${string}`,
      value: parseEther(amount.toString()),
      chain: sepolia
    })

    console.log('Transaction hash:', hash)

    return new Response(
      JSON.stringify({ 
        success: true,
        transactionHash: hash
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