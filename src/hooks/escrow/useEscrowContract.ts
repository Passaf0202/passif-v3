import { usePublicClient, useWalletClient } from 'wagmi';
import { ethers } from "ethers";

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

  const getContract = async (address: string) => {
    if (!walletClient) return null;
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(address, ESCROW_ABI, signer);
  };

  return { getContract };
};