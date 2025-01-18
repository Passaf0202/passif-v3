import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TradecoinerEscrow = await ethers.getContractFactory("TradecoinerEscrow");
  const escrow = await TradecoinerEscrow.deploy();

  await escrow.waitForDeployment();

  console.log("TradecoinerEscrow deployed to:", await escrow.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });