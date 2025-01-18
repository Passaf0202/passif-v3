import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';
import { abi } from '../contracts/abi/TradecoinerEscrow.json';
import { bytecode } from '../contracts/bytecode/TradecoinerEscrow.json';

// This is a development private key, DO NOT use in production
const DEPLOYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
  console.log('Starting deployment...');

  const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
  
  const publicClient = createPublicClient({
    chain: localhost,
    transport: http()
  });

  const walletClient = createWalletClient({
    account,
    chain: localhost,
    transport: http()
  });

  try {
    console.log('Deploying contract from address:', account.address);

    const hash = await walletClient.deployContract({
      abi,
      bytecode: bytecode as `0x${string}`,
      account,
      args: [], // No constructor arguments needed
      gas: BigInt(3000000)
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log('Contract deployed to:', receipt.contractAddress);
    return receipt.contractAddress;
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });