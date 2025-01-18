import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'npm:viem'
import { privateKeyToAccount } from 'npm:viem/accounts'
import { sepolia } from 'npm:viem/chains'

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

    // Validate required parameters
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

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    });

    // Vérifier le solde de l'acheteur (qui servira d'escrow)
    const balance = await publicClient.getBalance({ 
      address: buyerAddress as `0x${string}` 
    });
    console.log('Buyer balance:', formatEther(balance), 'ETH');

    const ethAmount = parseEther(amount.toString());
    console.log('Transaction amount:', formatEther(ethAmount), 'ETH');

    // Estimer le gas
    const gasEstimate = await publicClient.estimateGas({
      account: buyerAddress as `0x${string}`,
      to: sellerAddress as `0x${string}`,
      value: ethAmount,
    });

    const gasPrice = await publicClient.getGasPrice();
    const totalCost = (gasEstimate * gasPrice) + ethAmount;

    console.log('Estimated costs:', {
      gas: formatEther(gasEstimate * gasPrice),
      amount: formatEther(ethAmount),
      total: formatEther(totalCost)
    });

    // Si l'acheteur n'a pas assez de fonds
    if (balance < totalCost) {
      const error = {
        error: 'insufficient_escrow_funds',
        details: {
          have: formatEther(balance),
          want: formatEther(totalCost),
          missing: formatEther(totalCost - balance)
        }
      };
      return new Response(
        JSON.stringify(error),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Add 20% buffer to gas estimate
    const gasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.2));
    console.log('Gas limit with buffer:', gasLimit.toString());

    // Créer une transaction depuis le wallet de l'acheteur (qui sert d'escrow)
    const walletClient = createWalletClient({
      chain: sepolia,
      transport: http()
    });

    const hash = await walletClient.sendTransaction({
      account: buyerAddress as `0x${string}`,
      to: sellerAddress as `0x${string}`,
      value: ethAmount,
      gas: gasLimit,
      chain: sepolia
    });

    console.log('Transaction hash:', hash);

    return new Response(
      JSON.stringify({ 
        success: true,
        transactionHash: hash
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