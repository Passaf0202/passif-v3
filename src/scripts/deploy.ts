import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

async function main() {
  const [deployer]: HardhatEthersSigner[] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const TradecoinerEscrow = await ethers.getContractFactory("TradecoinerEscrow");
  const escrow = await TradecoinerEscrow.deploy();

  await escrow.waitForDeployment();
  
  const escrowAddress = await escrow.getAddress();
  console.log("TradecoinerEscrow deployed to:", escrowAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });