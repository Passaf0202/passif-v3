import { ethers } from "hardhat";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log("Starting deployment to Polygon Amoy...");
    
    const CryptoEscrow = await ethers.getContractFactory("CryptoEscrow");
    console.log("Contract factory created successfully");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Vérifier que nous avons assez de POL pour le déploiement
    const balance = await deployer.getBalance();
    if (balance.lt(ethers.parseEther("0.1"))) {
      throw new Error("Insufficient POL balance for deployment");
    }

    // Utiliser un prix du gas plus conservateur
    const gasPrice = await ethers.provider.getGasPrice();
    const estimatedGasPrice = gasPrice.mul(120).div(100); // Augmenter de 20%
    
    console.log("Deploying contract with params:", {
      gasPrice: ethers.utils.formatUnits(estimatedGasPrice, "gwei"),
      gasLimit: 2000000
    });

    // Deploy with platform address and 5% fee
    const escrow = await CryptoEscrow.deploy(
      deployer.address, // test seller
      deployer.address, // platform address
      5, // 5% platform fee
      { 
        value: ethers.parseEther("0.001"), // Test value
        gasPrice: estimatedGasPrice,
        gasLimit: 2000000
      }
    );
    
    console.log("Waiting for deployment transaction...");
    await escrow.waitForDeployment();
    
    const escrowAddress = await escrow.getAddress();
    console.log("CryptoEscrow deployed successfully to:", escrowAddress);

    // Disable all existing contracts
    const { error: updateError } = await supabase
      .from('smart_contracts')
      .update({ is_active: false })
      .eq('name', 'Escrow');

    if (updateError) {
      console.error("Error updating existing contracts:", updateError);
      throw updateError;
    }

    // Store the new contract address in Supabase
    const { error } = await supabase
      .from('smart_contracts')
      .insert([
        {
          name: 'Escrow',
          address: escrowAddress,
          network: 'polygon_amoy',
          chain_id: 80002,
          is_active: true
        }
      ]);

    if (error) {
      console.error("Error storing contract address:", error);
      throw error;
    }

    console.log("Contract address stored successfully in Supabase");
    
    // Vérifier que le contrat est bien déployé
    const code = await ethers.provider.getCode(escrowAddress);
    if (code === "0x") {
      throw new Error("Contract deployment failed - no code at address");
    }

    return escrowAddress;
  } catch (error) {
    console.error("Deployment failed with error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error during deployment:", error);
    process.exit(1);
  });