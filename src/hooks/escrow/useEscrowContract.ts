import { ethers } from "ethers";
import { ESCROW_ABI, ESCROW_BYTECODE } from "./escrowConstants";

export const useEscrowContract = () => {
  const deployNewContract = async (sellerAddress: string, amount: ethers.BigNumber) => {
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

    const contract = await factory.deploy(sellerAddress, { value: amount });
    console.log('Waiting for deployment transaction:', contract.deployTransaction.hash);
    
    const receipt = await contract.deployTransaction.wait();
    console.log('Deployment receipt:', receipt);

    return { contract, receipt };
  };

  return { deployNewContract };
};