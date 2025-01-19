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
        .maybeSingle();

      if (error) {
        console.error('Error fetching active contract:', error);
        throw error;
      }

      if (!data) {
        console.log('No active contract found, deploying new one...');
        // Appeler la fonction de déploiement
        const { data: deployResponse, error: deployError } = await supabase.functions.invoke('deploy-escrow');
        
        if (deployError) {
          console.error('Error deploying contract:', deployError);
          throw deployError;
        }

        console.log('Contract deployed:', deployResponse);

        // Récupérer le contrat nouvellement déployé
        const { data: newContract, error: fetchError } = await supabase
          .from('smart_contracts')
          .select('*')
          .eq('name', 'Escrow')
          .eq('is_active', true)
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return new ethers.Contract(address, ESCROW_ABI, signer);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      throw error;
    }
  };

  return { getContract, getActiveContract };
};