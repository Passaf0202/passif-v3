import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { ethers } from 'https://esm.sh/ethers@5.7.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting escrow contract deployment...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const privateKey = Deno.env.get('CONTRACT_PRIVATE_KEY');

    if (!supabaseUrl || !supabaseKey || !privateKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // BSC Testnet provider
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    const wallet = new ethers.Wallet(privateKey, provider);

    const escrowAbi = [
      "constructor(address _seller) payable",
      "function deposit(address _seller) external payable",
      "function confirmTransaction() public",
      "function getStatus() public view returns (bool, bool, bool, bool)",
      "event FundsDeposited(address buyer, address seller, uint256 amount)",
      "event TransactionConfirmed(address confirmer)",
      "event FundsReleased(address seller, uint256 amount)"
    ];

    const bytecode = "0x608060405260006003556000600460006101000a81548160ff0219169083151502179055506000600460016101000a81548160ff0219169083151502179055506000600460026101000a81548160ff0219169083151502179055506000600460036101000a81548160ff02191690831515021790555034801561008557600080fd5b5061091d806100956000396000f3..."; // Ajoutez le bytecode complet ici

    const factory = new ethers.ContractFactory(escrowAbi, bytecode, wallet);
    
    // Déployer avec une adresse temporaire et un petit montant pour l'initialisation
    const escrow = await factory.deploy(wallet.address, { value: ethers.utils.parseEther("0.01") });
    await escrow.deployed();

    console.log('Contract deployed at:', escrow.address);

    // Désactiver les contrats existants
    await supabase
      .from('smart_contracts')
      .update({ is_active: false })
      .eq('name', 'Escrow');

    // Sauvegarder le nouveau contrat
    const { error } = await supabase
      .from('smart_contracts')
      .insert({
        name: 'Escrow',
        address: escrow.address,
        network: 'bsc_testnet',
        chain_id: 97,
        is_active: true
      });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        contract_address: escrow.address 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Deployment error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
