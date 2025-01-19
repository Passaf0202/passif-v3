import { ethers } from "hardhat";
import { createClient } from "@supabase/supabase-js";

// Créer le client Supabase avec les variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log("Starting deployment to BSC Testnet...");
    
    // Get the contract factory
    const CryptoEscrow = await ethers.getContractFactory("CryptoEscrow");
    console.log("Contract factory created");

    // Get the deployer's address
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Deploy the contract with a dummy seller address (it will be set per transaction)
    const escrow = await CryptoEscrow.deploy(deployer.address);
    await escrow.waitForDeployment();
    
    const escrowAddress = await escrow.getAddress();
    console.log("CryptoEscrow deployed to:", escrowAddress);

    // Store the contract address in Supabase
    const { error } = await supabase
      .from('smart_contracts')
      .insert([
        {
          name: 'Escrow',
          address: escrowAddress,
          network: 'bsc_testnet',
          chain_id: 97,
          is_active: true
        }
      ]);

    if (error) {
      console.error("Error storing contract address:", error);
    } else {
      console.log("Contract address stored in Supabase");
    }

    return escrowAddress;
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });