import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";
import { formatAddress } from "@/utils/addressUtils";

const ESCROW_ABI = [
  "constructor(address _seller) payable",
  "function deposit(address _seller) external payable",
  "function confirmTransaction() public",
  "function getStatus() public view returns (bool, bool, bool, bool)",
  "event FundsDeposited(address buyer, address seller, uint256 amount)",
  "event TransactionConfirmed(address confirmer)",
  "event FundsReleased(address seller, uint256 amount)"
];

export class EscrowContractService {
  static async getActiveContract() {
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
      console.log('No active contract found');
      throw new Error('No active contract found');
    }

    console.log('Active contract found:', data);
    return data;
  }

  static async getContract(address: string) {
    if (!window.ethereum) {
      console.error('MetaMask not installed');
      throw new Error('Veuillez installer MetaMask pour continuer');
    }

    try {
      console.log('Creating contract instance for address:', address);
      
      // Forcer le changement de réseau vers BSC Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }], // BSC Testnet chainId
      }).catch(async (switchError: any) => {
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

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Vérifier que le contrat est déployé
      const code = await provider.getCode(address);
      if (code === '0x') {
        throw new Error('Le contrat n\'est pas déployé à cette adresse');
      }

      const contract = new ethers.Contract(address, ESCROW_ABI, signer);
      console.log('Contract instance created successfully');
      
      return contract;
    } catch (error) {
      console.error('Error creating contract instance:', error);
      throw error;
    }
  }
}