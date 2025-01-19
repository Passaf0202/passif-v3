import { ethers } from "hardhat";
import { supabase } from "@/integrations/supabase/client";

async function main() {
  try {
    console.log("Starting deployment to BSC Testnet...");
    
    // Get the contract factory
    const CryptoEscrow = await ethers.getContractFactory("CryptoEscrow");
    console.log("Contract factory created");

    // Deploy the contract
    console.log("Deploying CryptoEscrow...");
    const escrow = await CryptoEscrow.deploy();
    await escrow.waitForDeployment();
    
    const escrowAddress = await escrow.getAddress();
    console.log("CryptoEscrow deployed to:", escrowAddress);

    // Store the contract address in Supabase
    const { error } = await supabase
      .from('smart_contracts')
      .insert([
        {
          name: 'CryptoEscrow',
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