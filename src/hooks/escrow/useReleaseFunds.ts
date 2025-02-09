
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export const useReleaseFunds = (transactionId: string, blockchainTxnId: string | undefined, sellerAddress: string | null) => {
  const [isReleasing, setIsReleasing] = useState(false);
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const handleReleaseFunds = async () => {
    if (!sellerAddress) {
      toast({
        title: "Erreur",
        description: "Adresse du vendeur manquante",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReleasing(true);

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      let txnId: number;
      if (!blockchainTxnId || blockchainTxnId === '0') {
        const count = await contract.transactionCount();
        txnId = count.toNumber();
        console.log('Using latest transaction ID:', txnId);
      } else {
        txnId = Number(blockchainTxnId);
      }

      // Vérifier que la transaction existe et correspond
      const txnData = await contract.transactions(txnId);
      console.log('Transaction data before release:', txnData);

      if (txnData.seller.toLowerCase() !== sellerAddress.toLowerCase()) {
        throw new Error("L'adresse du vendeur ne correspond pas à celle de la transaction");
      }

      if (txnData.isCompleted) {
        throw new Error("Les fonds ont déjà été libérés");
      }

      console.log('Releasing funds for transaction:', txnId);
      const tx = await contract.releaseFunds(txnId);
      console.log('Release funds transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Release funds receipt:', receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            escrow_status: 'completed',
            released_at: new Date().toISOString(),
            buyer_confirmation: true
          })
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Fonds libérés avec succès",
          description: "Les fonds ont été envoyés au vendeur.",
        });

        // Vérifier l'état final de la transaction
        const txnDataAfter = await contract.transactions(txnId);
        console.log('Transaction data after release:', txnDataAfter);
      } else {
        throw new Error("La transaction a échoué sur la blockchain");
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
        variant: "destructive",
      });
    } finally {
      setIsReleasing(false);
    }
  };

  return { isReleasing, handleReleaseFunds };
};
