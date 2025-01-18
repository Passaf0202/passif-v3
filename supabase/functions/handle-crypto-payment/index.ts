import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createPublicClient, http, parseEther, formatEther } from 'npm:viem'
import { bsc } from 'npm:viem/chains'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, buyerAddress, sellerAddress, amount, includeEscrowFees } = await req.json();
    console.log('Processing payment for:', { listingId, buyerAddress, sellerAddress, amount, includeEscrowFees });

    if (!listingId || !buyerAddress || !sellerAddress || !amount) {
      console.error('Missing parameters:', { listingId, buyerAddress, sellerAddress, amount });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const publicClient = createPublicClient({
      chain: bsc,
      transport: http()
    });

    // Vérifier que le montant est valide
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      console.error('Invalid amount:', amount);
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const bnbAmount = parseEther(amount.toString());
    console.log('Transaction amount:', formatEther(bnbAmount), 'BNB');

    // Estimer le gas
    const gasEstimate = await publicClient.estimateGas({
      account: buyerAddress as `0x${string}`,
      to: sellerAddress as `0x${string}`,
      value: bnbAmount,
    });

    const gasPrice = await publicClient.getGasPrice();
    console.log('Estimated gas costs:', {
      gasEstimate: gasEstimate.toString(),
      gasPrice: formatEther(gasPrice),
    });

    // Préparer les données de transaction
    const transactionRequest = {
      to: sellerAddress,
      value: bnbAmount.toString(),
      gas: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
    };

    console.log('Prepared transaction request:', transactionRequest);

    return new Response(
      JSON.stringify({ 
        success: true,
        transaction: transactionRequest
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});