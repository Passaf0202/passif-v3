
import { ethers } from "ethers";
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from "../types/escrow";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useBlockchainTransaction = () => {
  const getBlockchainTransaction = async (transactionId: string) => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      ESCROW_CONTRACT_ADDRESS,
      ESCROW_ABI,
      provider
    );

    const latestBlock = await provider.getBlockNumber();
    const events = await contract.queryFilter('*', latestBlock - 1000, latestBlock);
    
    console.log("Found blockchain events:", events);

    if (events.length === 0) {
      throw new Error("Transaction non trouvée sur la blockchain");
    }

    const txnIdBN = ethers.BigNumber.from(transactionId);
    const txn = await contract.getTransaction(txnIdBN);
    console.log("Transaction details from contract:", txn);

    const amountInEther = parseFloat(ethers.utils.formatEther(txn.amount || '0'));
    console.log("Parsed amount:", amountInEther);

    return {
      amount: amountInEther,
      blockchain_txn_id: txnIdBN.toString(),
      status: 'pending',
      escrow_status: 'pending',
      commission_amount: amountInEther * 0.05,
      token_symbol: 'ETH',
      can_be_cancelled: true,
      funds_secured: false,
      buyer_confirmation: false,
      seller_confirmation: false
    };
  };

  return {
    getBlockchainTransaction
  };
};

interface UseReleaseFundsOptions {
  transactionId: string;
  onSuccess?: () => void;
  onError?: () => void;
}

export const useReleaseFunds = ({ transactionId, onSuccess, onError }: UseReleaseFundsOptions) => {
  const [isReleasing, setIsReleasing] = useState(false);
  const { toast } = useToast();

  const releaseFunds = async () => {
    try {
      setIsReleasing(true);
      
      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      console.log("Releasing funds for transaction:", transactionId);
      const txnIdBN = ethers.BigNumber.from(transactionId);
      const tx = await contract.releaseFunds(txnIdBN);
      
      console.log("Release funds transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Release funds transaction receipt:", receipt);

      toast({
        title: "Fonds libérés avec succès",
        description: "La transaction a été validée sur la blockchain"
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      toast({
        title: "Erreur lors de la libération des fonds",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
      
      if (onError) {
        onError();
      }
    } finally {
      setIsReleasing(false);
    }
  };

  return {
    releaseFunds,
    isReleasing
  };
};
