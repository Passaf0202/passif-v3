import { ethers } from "hardhat";

async function main() {
  try {
    console.log("Starting test deployment to Polygon Amoy...");
    
    const TestDeploy = await ethers.getContractFactory("TestDeploy");
    console.log("Contract factory created successfully");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Vérifier le solde
    const balance = await deployer.getBalance();
    if (balance.lt(ethers.parseEther("0.1"))) {
      throw new Error("Insufficient POL balance for deployment");
    }

    // Configuration de base pour le déploiement
    const gasPrice = await ethers.provider.getGasPrice();
    console.log("Current gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
    console.log("Estimated deployment cost:", ethers.utils.formatEther(gasPrice.mul(1000000)), "POL");

    const testContract = await TestDeploy.deploy({
      value: ethers.parseEther("0.0001"), // Très petite valeur pour le test
      gasPrice: gasPrice,
      gasLimit: 1000000 // Limite de gas réduite pour ce contrat simple
    });
    
    console.log("Deployment transaction sent. Hash:", testContract.deployTransaction?.hash);
    console.log("Waiting for deployment transaction...");
    await testContract.waitForDeployment();
    
    const contractAddress = await testContract.getAddress();
    console.log("TestDeploy deployed successfully to:", contractAddress);

    // Vérifier que le contrat est bien déployé
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error("Contract deployment failed - no code at address");
    }

    console.log("Contract deployment verified successfully");
    return contractAddress;

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