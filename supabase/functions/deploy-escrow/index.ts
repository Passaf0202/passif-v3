import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { ethers } from 'npm:ethers'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sellerAddress } = await req.json()
    console.log('Deploying escrow contract for seller:', sellerAddress)

    // Récupérer la clé privée depuis les variables d'environnement
    const privateKey = Deno.env.get('CONTRACT_PRIVATE_KEY')
    if (!privateKey) {
      throw new Error('Private key not configured')
    }

    // Configurer le provider BSC Testnet
    const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545')
    const wallet = new ethers.Wallet(privateKey, provider)

    // ABI et Bytecode du contrat
    const abi = [
      "constructor(address _seller) payable",
      "function deposit(address _seller) external payable",
      "function confirmTransaction() public",
      "function getStatus() public view returns (bool, bool, bool)",
      "event FundsDeposited(address buyer, address seller, uint256 amount)",
      "event TransactionConfirmed(address confirmer)",
      "event FundsReleased(address seller, uint256 amount)"
    ];
    const bytecode = "0x..."; // Votre bytecode ici

    // Créer et déployer le contrat
    const factory = new ethers.ContractFactory(abi, bytecode, wallet)
    const contract = await factory.deploy(sellerAddress)
    await contract.waitForDeployment()

    const contractAddress = await contract.getAddress()
    console.log('Contract deployed at:', contractAddress)

    // Sauvegarder l'adresse du contrat dans Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase
      .from('smart_contracts')
      .insert([
        {
          name: 'Escrow',
          address: contractAddress,
          network: 'bsc_testnet',
          chain_id: 97,
          is_active: true
        }
      ])

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        contractAddress 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Deployment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})
