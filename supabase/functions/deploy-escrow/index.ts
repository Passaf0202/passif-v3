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
    let privateKey = Deno.env.get('CONTRACT_PRIVATE_KEY');

    if (!supabaseUrl || !supabaseKey || !privateKey) {
      throw new Error('Missing environment variables');
    }

    // Remove any whitespace and normalize the private key
    privateKey = privateKey.trim();

    // Remove '0x' prefix if present
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.slice(2);
    }

    // Validate that the private key is a 64-character hex string (32 bytes)
    const privateKeyRegex = /^[0-9a-fA-F]{64}$/;
    if (!privateKeyRegex.test(privateKey)) {
      throw new Error('Invalid private key format. Must be a 64-character hexadecimal string');
    }

    // Add '0x' prefix back for ethers.js
    privateKey = `0x${privateKey}`;

    console.log('Private key format validated');

    // Test wallet creation
    try {
      const testWallet = new ethers.Wallet(privateKey);
      console.log('Wallet address:', testWallet.address);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Invalid private key: Unable to create wallet');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // BSC Testnet provider
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('Wallet address:', wallet.address);

    const escrowAbi = [
      "constructor(address _seller) payable",
      "function deposit(address _seller) external payable",
      "function confirmTransaction() public",
      "function getStatus() public view returns (bool, bool, bool, bool)",
      "event FundsDeposited(address buyer, address seller, uint256 amount)",
      "event TransactionConfirmed(address confirmer)",
      "event FundsReleased(address seller, uint256 amount)"
    ];

    const bytecode = "0x608060405260006003556000600460006101000a81548160ff0219169083151502179055506000600460016101000a81548160ff0219169083151502179055506000600460026101000a81548160ff0219169083151502179055506000600460036101000a81548160ff02191690831515021790555034801561008557600080fd5b506000341161012a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f416d6f756e74206d757374206265206772656174657220746861742030000000815250602001915050604051809103906000f080158015610112573d6000803e3d6000fd5b506000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b600073ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614156101ed576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260168152602001807f496e76616c696420636f6e747261637420616464726573730000000000000000815250602001915050604051809103906000f0801580156101d5573d6000803e3d6000fd5b506000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102b0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f53656c6c65722063616e6e6f74206265206275796572000000000000000000008152506020019150506040518091039060006000f080158015610298573d6000803e3d6000fd5b506000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b336001806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff166002806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555034600381905550600460036101000a81548160ff0219169083151502179055507f5d13ab3066618e228a9af5075be570dcf9e5c4634a1e71c4234389de56d3e69e336000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600354604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828152602001935050505060405180910390a161045c806104296000396000f300608060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806312065fe014610067578063481c6a75146100925780635d13ab30146100e9578063a035b1fe14610140575b600080fd5b34801561007357600080fd5b5061007c61016b565b6040518082815260200191505060405180910390f35b34801561009e57600080fd5b506100a7610189565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156100f557600080fd5b506100fe6101af565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561014c57600080fd5b506101556101d5565b6040518082815260200191505060405180910390f35b60003073ffffffffffffffffffffffffffffffffffffffff1631905090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600354815600a165627a7a72305820a3f97f907f3a528e5958a1a5f6e7a70691f5f5c5f5d5c5f5d5c5f5d5c5f5d5c0029";

    const factory = new ethers.ContractFactory(escrowAbi, bytecode, wallet);
    
    // Déployer avec une adresse de test pour l'initialisation
    console.log('Deploying contract with initial value...');
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