import { ethers } from "hardhat";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log("Starting deployment to BSC Testnet...");
    
    const CryptoEscrow = await ethers.getContractFactory("CryptoEscrow");
    console.log("Contract factory created");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Déployer avec une adresse de test pour l'initialisation
    const escrow = await CryptoEscrow.deploy(deployer.address, { value: ethers.parseEther("0.01") });
    await escrow.waitForDeployment();
    
    const escrowAddress = await escrow.getAddress();
    console.log("CryptoEscrow deployed to:", escrowAddress);

    // Désactiver tous les contrats existants
    const { error: updateError } = await supabase
      .from('smart_contracts')
      .update({ is_active: false })
      .eq('name', 'Escrow');

    if (updateError) {
      console.error("Error updating existing contracts:", updateError);
    }

    // Stocker la nouvelle adresse du contrat dans Supabase
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