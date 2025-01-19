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
      throw new Error('Missing required environment variables');
    }

    // Validate and format private key
    let formattedPrivateKey = privateKey.trim().toLowerCase();
    if (formattedPrivateKey.startsWith('0x')) {
      formattedPrivateKey = formattedPrivateKey.slice(2);
    }

    console.log('Private key length:', formattedPrivateKey.length);
    
    // Strict validation
    if (!/^[0-9a-f]{64}$/.test(formattedPrivateKey)) {
      console.error('Invalid private key format:', {
        length: formattedPrivateKey.length,
        isHex: /^[0-9a-f]*$/.test(formattedPrivateKey),
      });
      throw new Error(`Invalid private key format. Must be a 64-character hexadecimal string. Current length: ${formattedPrivateKey.length}`);
    }

    formattedPrivateKey = `0x${formattedPrivateKey}`;
    console.log('Private key validated successfully');

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize wallet
    let wallet;
    try {
      wallet = new ethers.Wallet(formattedPrivateKey);
      console.log('Wallet created successfully. Address:', wallet.address);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet with provided private key');
    }

    // Connect to BSC Testnet
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    wallet = wallet.connect(provider);
    console.log('Connected wallet to BSC Testnet');

    // Contract configuration
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

    // Deploy contract
    console.log('Deploying contract with initial value...');
    const factory = new ethers.ContractFactory(escrowAbi, bytecode, wallet);
    const escrow = await factory.deploy(wallet.address, { value: ethers.utils.parseEther("0.01") });
    await escrow.deployed();

    console.log('Contract deployed at:', escrow.address);

    // Update database
    const { error: updateError } = await supabase
      .from('smart_contracts')
      .update({ is_active: false })
      .eq('name', 'Escrow');

    if (updateError) {
      console.error('Error updating existing contracts:', updateError);
    }

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
      console.error('Error storing contract address:', error);
      throw error;
    }

    console.log('Contract address stored in database');

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