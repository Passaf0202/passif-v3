import { usePublicClient, useWalletClient } from 'wagmi';
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_ABI = [
  "constructor(address _seller) payable",
  "function deposit(address _seller) external payable",
  "function confirmTransaction() public",
  "function getStatus() public view returns (bool, bool, bool, bool)",
  "event FundsDeposited(address buyer, address seller, uint256 amount)",
  "event TransactionConfirmed(address confirmer)",
  "event FundsReleased(address seller, uint256 amount)"
];

export const useEscrowContract = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const getActiveContract = async () => {
    try {
      console.log('Fetching active contract...');
      const { data, error } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('name', 'Escrow')
        .eq('is_active', true)
        .eq('network', 'bsc_testnet')
        .maybeSingle();

      if (error) {
        console.error('Error fetching active contract:', error);
        throw error;
      }

      if (!data) {
        console.log('No active contract found on BSC, deploying new one...');
        const { data: deployResponse, error: deployError } = await supabase.functions.invoke('deploy-escrow');
        
        if (deployError) {
          console.error('Error deploying contract:', deployError);
          throw deployError;
        }

        console.log('Contract deployed:', deployResponse);

        const { data: newContract, error: fetchError } = await supabase
          .from('smart_contracts')
          .select('*')
          .eq('name', 'Escrow')
          .eq('is_active', true)
          .eq('network', 'bsc_testnet')
          .maybeSingle();

        if (fetchError || !newContract) {
          console.error('Error fetching newly deployed contract:', fetchError);
          throw new Error('Failed to fetch newly deployed contract');
        }

        console.log('New contract fetched:', newContract);
        return newContract;
      }

      console.log('Active contract found:', data);
      return data;
    } catch (error) {
      console.error('Error in getActiveContract:', error);
      throw error;
    }
  };

  const getContract = async (address: string) => {
    if (!walletClient || !window.ethereum) {
      console.error('Wallet not connected');
      return null;
    }
    
    try {
      console.log('Creating contract instance for address:', address);
      
      // Forcer le changement de réseau vers BSC Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }], // BSC Testnet chainId
      }).catch(async (switchError: any) => {
        // Si le réseau n'existe pas, on l'ajoute
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x61',
              chainName: 'BSC Testnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'tBNB',
                decimals: 18
              },
              rpcUrls: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
              blockExplorerUrls: ['https://testnet.bscscan.com']
            }]
          });
        } else {
          throw switchError;
        }
      });

      // Vérifier que nous sommes bien sur BSC Testnet
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x61') {
        throw new Error('Veuillez vous connecter au réseau BSC Testnet');
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, ESCROW_ABI, signer);

      // Vérifier que le contrat est déployé
      const code = await provider.getCode(address);
      if (code === '0x') {
        throw new Error('Le contrat nest pas déployé à cette adresse');
      }

      return contract;
    } catch (error) {
      console.error('Error creating contract instance:', error);
      throw error;
    }
  };

  return { getContract, getActiveContract };
};