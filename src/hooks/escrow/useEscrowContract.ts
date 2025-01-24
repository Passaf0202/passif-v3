import { ethers } from "ethers";
import { ESCROW_ABI, ESCROW_BYTECODE } from "./escrowConstants";

interface DeployOptions {
  gasLimit?: ethers.BigNumber;
  gasPrice?: ethers.BigNumber;
}

export const useEscrowContract = () => {
  const deployNewContract = async (
    sellerAddress: string, 
    amount: string | bigint,
    options?: DeployOptions
  ) => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    console.log('Deploying new escrow contract with params:', {
      seller: sellerAddress,
      value: amount.toString()
    });

    const factory = new ethers.ContractFactory(
      ESCROW_ABI,
      ESCROW_BYTECODE,
      signer
    );

    // S'assurer que le montant est un BigNumber
    const valueInWei = ethers.BigNumber.from(amount.toString());
    const deployOptions: { 
      value: ethers.BigNumber;
      gasLimit?: ethers.BigNumber;
      gasPrice?: ethers.BigNumber;
    } = { 
      value: valueInWei 
    };

    if (options?.gasLimit) {
      deployOptions.gasLimit = options.gasLimit;
    }
    if (options?.gasPrice) {
      deployOptions.gasPrice = options.gasPrice;
    }

    console.log('Deploying contract with options:', deployOptions);

    const contract = await factory.deploy(sellerAddress, deployOptions);
    console.log('Waiting for deployment transaction:', contract.deployTransaction.hash);
    
    const receipt = await contract.deployTransaction.wait();
    console.log('Deployment receipt:', receipt);

    return { contract, receipt };
  };

  return { 
    deployNewContract
  };
};