import { ethers } from "hardhat";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CryptoEscrow = await ethers.getContractFactory("CryptoEscrow");
  
  // Déployer avec une adresse de test pour l'initialisation
  const escrow = await CryptoEscrow.deploy(deployer.address, { value: ethers.parseEther("0.01") });

  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("CryptoEscrow deployed to:", escrowAddress);

  // Sauvegarder dans Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  // Désactiver les contrats existants
  await supabase
    .from('smart_contracts')
    .update({ is_active: false })
    .eq('name', 'Escrow');

  // Ajouter le nouveau contrat
  const { error } = await supabase
    .from('smart_contracts')
    .insert({
      name: 'Escrow',
      address: escrowAddress,
      network: 'bsc_testnet',
      chain_id: 97,
      is_active: true
    });

  if (error) {
    console.error("Error saving to Supabase:", error);
    return;
  }

  console.log("Contract saved to Supabase successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });