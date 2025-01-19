import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { ethers } from 'npm:ethers@5.7.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const privateKey = Deno.env.get('CONTRACT_PRIVATE_KEY')
    if (!privateKey) {
      throw new Error('Contract private key not configured')
    }

    // Configuration BSC Testnet
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/')
    const wallet = new ethers.Wallet(privateKey, provider)

    console.log('Deploying contract with wallet:', wallet.address)

    // Bytecode et ABI du contrat
    const escrowBytecode = "0x..."  // Add your contract bytecode here
    const escrowABI = [
      "constructor(address _seller) payable",
      "function confirmTransaction() public",
      "function getStatus() public view returns (bool, bool, bool)",
      "event FundsDeposited(address buyer, address seller, uint256 amount)",
      "event TransactionConfirmed(address confirmer)",
      "event FundsReleased(address seller, uint256 amount)"
    ]

    // Déploiement du contrat
    const factory = new ethers.ContractFactory(escrowABI, escrowBytecode, wallet)
    console.log('Deploying contract...')
    
    const contract = await factory.deploy()
    await contract.deployed()

    console.log('Contract deployed to:', contract.address)

    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Enregistrer le contrat dans la base de données
    const { error: insertError } = await supabase
      .from('smart_contracts')
      .insert({
        name: 'Escrow',
        address: contract.address,
        network: 'bsc-testnet',
        chain_id: 97,
        is_active: true
      })

    if (insertError) {
      console.error('Error saving contract:', insertError)
      throw new Error('Failed to save contract address')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        contract: contract.address
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