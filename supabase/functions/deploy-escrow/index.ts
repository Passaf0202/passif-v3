import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractDeploymentResponse {
  success: boolean;
  contractAddress?: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Configuration
    const PRIVATE_KEY = Deno.env.get('PRIVATE_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!PRIVATE_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log('Wallet address:', wallet.address);

    // Get contract artifacts
    const contractJson = await import('./CryptoEscrow.json', { assert: { type: "json" } });
    const abi = contractJson.default.abi;
    const bytecode = contractJson.default.bytecode;

    // Create contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log('Contract factory created');

    // Deploy contract
    console.log('Deploying contract...');
    const contract = await factory.deploy(
      wallet.address, // test seller
      wallet.address, // platform address
      ethers.ZeroAddress, // POL as default token
      5, // 5% platform fee
      { 
        gasLimit: 3000000
      }
    );

    console.log('Waiting for deployment...');
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log('Contract deployed to:', contractAddress);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Disable existing contracts
    await supabase
      .from('smart_contracts')
      .update({ is_active: false })
      .eq('name', 'Escrow');

    // Store new contract address
    const { error: insertError } = await supabase
      .from('smart_contracts')
      .insert([
        {
          name: 'Escrow',
          address: contractAddress,
          network: 'polygon_amoy',
          chain_id: 80002,
          is_active: true
        }
      ]);

    if (insertError) {
      throw new Error(`Failed to store contract address: ${insertError.message}`);
    }

    const response: ContractDeploymentResponse = {
      success: true,
      contractAddress
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Deployment failed:', error);
    
    const response: ContractDeploymentResponse = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});