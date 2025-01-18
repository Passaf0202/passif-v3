import { ethers } from "hardhat";

async function main() {
  const TradecoinerEscrow = await ethers.getContractFactory("TradecoinerEscrow");
  const escrow = await TradecoinerEscrow.deploy();

  await escrow.waitForDeployment();
  
  console.log(
    `TradecoinerEscrow deployed to ${await escrow.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});