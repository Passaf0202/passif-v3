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
    const privateKey = Deno.env.get('Private_KEY_BSC');

    if (!supabaseUrl || !supabaseKey || !privateKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize wallet
    const wallet = new ethers.Wallet(privateKey);
    console.log('Wallet created successfully. Address:', wallet.address);

    // Connect to BSC Testnet
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    const connectedWallet = wallet.connect(provider);
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

    const escrowBytecode = "608060405260006003556000600460006101000a81548160ff0219169083151502179055506000600460016101000a81548160ff0219169083151502179055506000600460026101000a81548160ff0219169083151502179055506000600460036101000a81548160ff021916908315150217905550610b3b806100836000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80631e6c3950146100625780635314d1001461007e5780636f9fb98a146100aa578063a035b1fe146100c8578063c040e6b8146100e6575b600080fd5b61007c60048036038101906100779190610736565b610104565b005b610088610420565b604051610095919061079c565b60405180910390f35b6100b2610446565b6040516100bf91906107c6565b60405180910390f35b6100d061044e565b6040516100dd91906107c6565b60405180910390f35b6100ee610454565b6040516100fb91906107e1565b60405180910390f35b600460029054906101000a900460ff1615610153576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161014a906108a4565b60405180910390fd5b600460039054906101000a900460ff166101a2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610199906108c4565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614806102345750600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b610273576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161026a906108e4565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561032357600460009054906101000a900460ff1615610316576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161030d90610904565b60405180910390fd5b6001600460006101000a81548160ff0219169083151502179055505b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156103d257600460019054906101000a900460ff16156103c5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103bc90610924565b60405180910390fd5b6001600460016101000a81548160ff0219169083151502179055505b7f5d13ab3066618e228a9af5075be570dcf9e5c4634a1e71c4234389de56d3e69e3360035460405161040592919061094e565b60405180910390a161041d6001600460026101000a81548160ff02191690831515021790555050565b565b600460039054906101000a900460ff1681565b60035481565b60035481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006104a38261047a565b9050919050565b6104b381610499565b81146104be57600080fd5b50565b6000813590506104d0816104aa565b92915050565b6000819050919050565b6104e9816104d6565b81146104f457600080fd5b50565b600081359050610506816104e0565b92915050565b60008060408385031215610523576105226104f7565b5b6000610531858286016104c1565b9250506020610542858286016104f7565b9150509250929050565b60008115159050919050565b6105618161054c565b82525050565b600060208201905061057c6000830184610558565b92915050565b6000819050919050565b61059581610582565b82525050565b60006020820190506105b0600083018461058c565b92915050565b6105bf81610582565b81146105ca57600080fd5b50565b6000813590506105dc816105b6565b92915050565b6000602082840312156105f8576105f76104f7565b5b6000610606848285016105cd565b91505092915050565b61061881610499565b82525050565b6000602082019050610633600083018461060f565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f84011261065d5761065c610638565b5b8235905067ffffffffffffffff81111561067a5761067961063d565b5b602083019150836001820283011115610696576106956106425b5b9250929050565b600080602083850312156106b4576106b36104f7565b5b600083013567ffffffffffffffff8111156106d2576106d16104fc565b5b6106de85828601610647565b92509250509250929050565b600082825260208201905092915050565b7f4e6f7420617574686f72697a656400000000000000000000000000000000000081525060200191505060405180910390fd5b600082825260208201905092915050565b7f46756e647320616c72656164792072656c65617365640000000000000000000081525060200191505060405180910390fd5b600082825260208201905092915050565b7f4e6f2066756e6473206465706f73697465640000000000000000000000000000815250602001915050604051809103906000f35b6000819050919050565b61079681610582565b82525050565b60006020820190506107b1600083018461078d565b92915050565b6107c081610582565b82525050565b60006020820190506107db60008301846107b7565b92915050565b60006020820190506107f660008301846107b7565b92915050565b600082825260208201905092915050565b7f4e6f7420617574686f72697a65640000000000000000000000000000000000008152506020019150506040518091039060005260206000f35b600082825260208201905092915050565b7f46756e647320616c72656164792072656c65617365640000000000000000000081525060200191505060405180910390fd5b600082825260208201905092915050565b7f4e6f2066756e6473206465706f73697465640000000000000000000000000000815250602001915050604051809103906000f35b600082825260208201905092915050565b7f427579657220616c726561647920636f6e6669726d65640000000000000000008152506020019150506040518091039060005260206000f35b600082825260208201905092915050565b7f53656c6c657220616c726561647920636f6e6669726d656400000000000000008152506020019150506040518091039060005260206000f35b600082825260208201905092915050565b61094881610499565b82525050565b600060408201905061096360008301856107b7565b61097060208301846107b7565b939250505056fea2646970667358221220f3f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f864736f6c63430008000033";

    // Deploy contract
    console.log('Deploying contract with initial value...');
    const factory = new ethers.ContractFactory(escrowAbi, escrowBytecode, connectedWallet);
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