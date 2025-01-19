import { usePublicClient, useWalletClient } from 'wagmi';
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_ABI = [
  "constructor(address _seller) payable",
  "function deposit(address _seller) external payable",
  "function confirmTransaction() public",
  "function getStatus() public view returns (bool, bool, bool)",
  "event FundsDeposited(address buyer, address seller, uint256 amount)",
  "event TransactionConfirmed(address confirmer)",
  "event FundsReleased(address seller, uint256 amount)"
];

export const useEscrowContract = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const getActiveContract = async () => {
    try {
      const { data: contract, error } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('name', 'Escrow')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return contract;
    } catch (error) {
      console.error('Error fetching active contract:', error);
      return null;
    }
  };

  const getContract = async (address: string) => {
    if (!walletClient || !window.ethereum) return null;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return new ethers.Contract(address, ESCROW_ABI, signer);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  };

  return { getContract, getActiveContract };
};