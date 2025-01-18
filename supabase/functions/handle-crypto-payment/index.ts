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

    if (!listingId || !buyerAddress || !sellerAddress || !amount) {
      throw new Error('Missing required parameters');
    }

    // Vérifier que le montant est valide
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error('Invalid amount');
    }

    const privateKey = Deno.env.get('CONTRACT_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('Contract private key not configured');
    }

    // Ensure private key starts with 0x
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    console.log('Using escrow account with formatted private key');

    const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
    console.log('Using escrow account:', account.address);

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    });

    // Vérifier le solde de l'escrow account
    const balance = await publicClient.getBalance({ address: account.address });
    console.log('Escrow account balance:', formatEther(balance), 'ETH');

    const ethAmount = parseEther(amount.toString());
    console.log('Transaction amount:', formatEther(ethAmount), 'ETH');

    // Estimer le gas
    const gasEstimate = await publicClient.estimateGas({
      account,
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

    // Si l'escrow n'a pas assez de fonds et que l'utilisateur n'a pas accepté de payer les frais
    if (balance < totalCost && !includeEscrowFees) {
      const error = {
        error: `The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.\n\nThis error could arise when the account does not have enough funds to:\n - pay for the total gas fee,\n - pay for the value to send.\n \nThe cost of the transaction is calculated as \`gas * gas fee + value\`, where:\n - \`gas\` is the amount of gas needed for transaction to execute,\n - \`gas fee\` is the gas fee,\n - \`value\` is the amount of ether to send to the recipient.\n \nEstimate Gas Arguments:\n  from:   ${account.address}\n  to:     ${sellerAddress}\n  value:  ${amount} ETH\n\nDetails: insufficient funds for gas * price + value: have ${balance} want ${totalCost}\nVersion: viem@2.22.9`
      };
      return new Response(
        JSON.stringify({ error }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const walletClient = createWalletClient({
      chain: sepolia,
      transport: http()
    });

    // Add 20% buffer to gas estimate
    const gasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.2));
    console.log('Gas limit with buffer:', gasLimit.toString());

    // Si l'utilisateur accepte de payer les frais d'escrow, on procède à la transaction
    const hash = await walletClient.sendTransaction({
      account,
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