import { ethers } from "hardhat";

async function main() {
  const CryptoEscrow = await ethers.getContractFactory("CryptoEscrow");
  
  console.log("Deploying CryptoEscrow...");
  const escrow = await CryptoEscrow.deploy();
  await escrow.waitForDeployment();
  
  console.log("CryptoEscrow deployed to:", await escrow.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });