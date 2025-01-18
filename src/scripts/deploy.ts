import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { abi } from '../contracts/abi/TradecoinerEscrow.json';
import { bytecode } from '../contracts/bytecode/TradecoinerEscrow.json';

async function main() {
  try {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    });

    const walletClient = createWalletClient({
      chain: sepolia,
      transport: http()
    });

    const privateKey = process.env.CONTRACT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('CONTRACT_PRIVATE_KEY not set');
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    console.log('Deploying contract from:', account.address);

    // Use legacy transaction type to avoid EIP-4844 requirements
    const hash = await walletClient.deployContract({
      account,
      abi,
      bytecode: bytecode as `0x${string}`,
      args: [],
      chain: sepolia,
      type: 'legacy' // Explicitly use legacy transaction type
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