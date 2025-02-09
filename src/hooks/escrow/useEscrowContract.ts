
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_ABI = [
  "function confirmTransaction(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "function getTransaction(uint256 _txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)"
];

export const useEscrowContract = () => {
  const getActiveContract = async () => {
    console.log('Fetching active smart contract...');
    const { data: contract, error } = await supabase
      .from('smart_contracts')
      .select('*')
      .eq('is_active', true)
      .eq('network', 'polygon_amoy')
      .maybeSingle();

    if (error) {
      console.error('Error fetching active contract:', error);
      throw new Error("Impossible de récupérer le contrat actif");
    }

    if (!contract) {
      console.error('No active contract found');
      throw new Error("Aucun contrat actif trouvé pour le réseau Polygon Amoy");
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

  return { 
    getContract,
    getActiveContract
  };
};
