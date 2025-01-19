import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CryptoEscrow = await ethers.getContractFactory("CryptoEscrow");
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