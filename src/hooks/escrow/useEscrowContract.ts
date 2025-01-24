import { ethers } from "ethers";
import { ESCROW_ABI, ESCROW_BYTECODE } from "./escrowConstants";
import { useToast } from "@/components/ui/use-toast";
import { amoy } from '@/config/chains';

interface DeployOptions {
  gasLimit?: ethers.BigNumber;
  gasPrice?: ethers.BigNumber;
}

export const useEscrowContract = () => {
  const { toast } = useToast();

  const deployNewContract = async (
    sellerAddress: string, 
    amount: string | bigint,
    options?: DeployOptions
  ) => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();

    // Vérifier si nous sommes sur le bon réseau
    if (network.chainId !== amoy.id) {
      console.error('Wrong network:', network.chainId, 'Expected:', amoy.id);
      
      try {
        // Tenter de basculer vers Polygon Amoy
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${amoy.id.toString(16)}` }],
        });
      } catch (switchError: any) {
        // Si le réseau n'est pas configuré, on l'ajoute
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${amoy.id.toString(16)}`,
                  chainName: amoy.name,
                  nativeCurrency: amoy.nativeCurrency,
                  rpcUrls: [amoy.rpcUrls.default.http[0]],
                  blockExplorerUrls: [amoy.blockExplorers.default.url],
                },
              ],
            });
          } catch (addError) {
            console.error('Error adding network:', addError);
            throw new Error("Impossible d'ajouter le réseau Polygon Amoy");
          }
        } else {
          console.error('Error switching network:', switchError);
          throw new Error("Impossible de changer de réseau");
        }
      }

      // Vérifier à nouveau le réseau après le changement
      const updatedNetwork = await provider.getNetwork();
      if (updatedNetwork.chainId !== amoy.id) {
        throw new Error("Veuillez vous connecter au réseau Polygon Amoy");
      }
    }

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

    try {
      console.log('Deploying contract with options:', deployOptions);
      const contract = await factory.deploy(sellerAddress, deployOptions);
      console.log('Waiting for deployment transaction:', contract.deployTransaction.hash);
      
      const receipt = await contract.deployTransaction.wait();
      console.log('Deployment receipt:', receipt);

      toast({
        title: "Contrat déployé avec succès",
        description: `Adresse du contrat : ${contract.address}`,
      });

      return { contract, receipt };
    } catch (error: any) {
      console.error('Contract deployment error:', error);
      
      // Améliorer les messages d'erreur
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error("Fonds insuffisants pour déployer le contrat");
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error("Erreur de connexion au réseau Polygon Amoy");
      } else {
        throw new Error(`Erreur lors du déploiement du contrat: ${error.message}`);
      }
    }
  };

  return { 
    deployNewContract
  };
};