import { ethers } from "ethers";
import { ESCROW_ABI, ESCROW_BYTECODE } from "./escrowConstants";
import { supabase } from "@/integrations/supabase/client";

interface DeployOptions {
  gasLimit?: ethers.BigNumber;
  gasPrice?: ethers.BigNumber;
}

export const useEscrowContract = () => {
  const getActiveContract = async () => {
    console.log('Fetching active smart contract...');
    const { data: contract, error } = await supabase
      .from('smart_contracts')
      .select('*')
      .eq('is_active', true)
      .eq('network', 'polygon_amoy')
      .single();

    if (error) {
      console.error('Error fetching active contract:', error);
      throw new Error("Impossible de récupérer le contrat actif");
    }

    console.log('Active contract found:', contract);
    return contract;
  };

  const getContract = async (address: string) => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé");
    }

    console.log('Initializing contract at address:', address);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    try {
      const contract = new ethers.Contract(address, ESCROW_ABI, signer);
      console.log('Contract initialized successfully');
      return contract;
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw new Error("Erreur lors de l'initialisation du contrat");
    }
  };

  const deployNewContract = async (
    sellerAddress: string, 
    amount: ethers.BigNumber,
    options?: DeployOptions
  ) => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    console.log('Deploying new escrow contract with params:', {
      seller: sellerAddress,
      value: amount.toString(),
      gasLimit: options?.gasLimit?.toString(),
      gasPrice: options?.gasPrice?.toString()
    });

    const factory = new ethers.ContractFactory(
      ESCROW_ABI,
      ESCROW_BYTECODE,
      signer
    );

    const deployOptions: any = { value: amount };
    if (options?.gasLimit) deployOptions.gasLimit = options.gasLimit;
    if (options?.gasPrice) deployOptions.gasPrice = options.gasPrice;

    const contract = await factory.deploy(sellerAddress, deployOptions);
    console.log('Waiting for deployment transaction:', contract.deployTransaction.hash);
    
    const receipt = await contract.deployTransaction.wait();
    console.log('Deployment receipt:', receipt);

    return { contract, receipt };
  };

  return { 
    deployNewContract,
    getContract,
    getActiveContract
  };
};