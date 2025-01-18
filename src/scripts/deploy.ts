import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';
import { abi, bytecode } from '../contracts/abi/TradecoinerEscrow.json';

async function main() {
  try {
    // Connect to local chain
    const publicClient = createPublicClient({
      chain: localhost,
      transport: http()
    });

    // Create wallet client
    const walletClient = createWalletClient({
      chain: localhost,
      transport: custom((window as any).ethereum)
    });

    // Use private key from environment
    const privateKey = '0x' + 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    console.log('Deploying contract...');
    
    const hash = await walletClient.deployContract({
      abi,
      bytecode: bytecode as `0x${string}`,
      account,
      args: [], // No constructor arguments needed
      gas: BigInt(3000000),
      chain: localhost,
      gasPrice: BigInt(1000000000)
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Contract deployed at:', receipt.contractAddress);
    
    return receipt.contractAddress;
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});