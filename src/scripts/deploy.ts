import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { abi } from '../contracts/abi/TradecoinerEscrow.json';

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

    const privateKey = '0x' + 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    console.log('Deploying contract...');
    
    const hash = await walletClient.deployContract({
      abi,
      account,
      args: [],
      chain: sepolia,
      bytecode: "0x608060405234801561001057600080fd5b50600080546001600160a01b031916331790556019600155612ee8806100366000396000f3fe6080604052600436106100e85760003560e01c80639b2452e51161008a578063c23b1a9611610059578063c23b1a96146102b7578063d0e30db0146102d7578063e2c1ed451461..." as `0x${string}`,
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