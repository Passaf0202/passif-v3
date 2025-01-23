import { ethers } from "hardhat";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log("Starting deployment to Polygon Mumbai...");
    console.log("Network config:", {
      chainId: 80001,
      url: "https://rpc-mumbai.maticvigil.com"
    });
    
    const CryptoEscrow = await ethers.getContractFactory("CryptoEscrow");
    console.log("Contract factory created successfully");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Vérifier que nous avons assez de MATIC pour le déploiement
    const balance = await deployer.getBalance();
    if (balance.lt(ethers.parseEther("0.1"))) {
      throw new Error("Insufficient MATIC balance for deployment. Please get test MATIC from the faucet.");
    }

    // Deploy with a test address for initialization and MATIC as default token
    console.log("Deploying contract...");
    const escrow = await CryptoEscrow.deploy(deployer.address, ethers.ZeroAddress, { 
      value: ethers.parseEther("0.01"),
      gasLimit: 3000000
    });
    
    console.log("Waiting for deployment transaction...");
    await escrow.waitForDeployment();
    
    const escrowAddress = await escrow.getAddress();
    console.log("CryptoEscrow deployed successfully to:", escrowAddress);

    // Disable all existing contracts
    console.log("Updating existing contracts in database...");
    const { error: updateError } = await supabase
      .from('smart_contracts')
      .update({ is_active: false })
      .eq('name', 'Escrow');

    if (updateError) {
      console.error("Error updating existing contracts:", updateError);
      throw updateError;
    }

    // Store the new contract address in Supabase
    console.log("Storing new contract address in database...");
    const { error } = await supabase
      .from('smart_contracts')
      .insert([
        {
          name: 'Escrow',
          address: escrowAddress,
          network: 'polygon_mumbai',
          chain_id: 80001,
          is_active: true
        }
      ]);

    if (error) {
      console.error("Error storing contract address:", error);
      throw error;
    }

    console.log("Contract address stored successfully in Supabase");
    console.log("Deployment completed successfully!");
    
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