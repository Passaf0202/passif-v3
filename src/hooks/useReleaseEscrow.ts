
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from "@/components/escrow/types/escrow";
import { useAccount } from 'wagmi';

export function useReleaseEscrow() {
  const [isReleasing, setIsReleasing] = useState(false);
  const { toast } = useToast();
  const { connector, isConnected } = useAccount();

  const releaseEscrow = async (blockchainTxnId: string) => {
    if (!isConnected) {
      throw new Error("Wallet non connecté");
    }

    try {
      setIsReleasing(true);
      console.log("[useReleaseEscrow] Releasing funds for transaction:", blockchainTxnId);

      // Obtenir le fournisseur et le signer
      let provider;
      if (typeof window !== 'undefined' && window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else if (isConnected && connector) {
        const connectorProvider = await connector.getProvider();
        provider = new ethers.providers.Web3Provider(connectorProvider);
      }

      if (!provider) {
        throw new Error("Impossible d'initialiser le provider. Veuillez vous connecter à votre wallet.");
      }

      const signer = provider.getSigner();
      
      // Initialiser le contrat
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // Convertir blockchainTxnId en nombre
      const txnId = ethers.BigNumber.from(blockchainTxnId);
      
      // Appeler la fonction releaseFunds
      console.log("[useReleaseEscrow] Calling releaseFunds with txnId:", txnId.toString());
      const tx = await contract.releaseFunds(txnId);
      
      // Attendre que la transaction soit confirmée
      console.log("[useReleaseEscrow] Transaction sent, waiting for confirmation. Hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("[useReleaseEscrow] Transaction confirmed:", receipt);

      // Vérifier les événements pour confirmer le succès
      const releaseEvent = receipt.events?.find(
        (e: any) => e.event === "FundsReleased"
      );

      if (!releaseEvent) {
        throw new Error("Événement FundsReleased non trouvé");
      }

      // Mettre à jour le statut de la transaction dans Supabase
      const { data, error } = await supabase
        .from('transactions')
        .select('id')
        .eq('blockchain_txn_id', blockchainTxnId)
        .single();

      if (error || !data) {
        console.error("[useReleaseEscrow] Error fetching transaction:", error);
        throw new Error("Impossible de trouver la transaction");
      }

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          escrow_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) {
        console.error("[useReleaseEscrow] Error updating transaction:", updateError);
        throw new Error("Impossible de mettre à jour le statut de la transaction");
      }

      console.log("[useReleaseEscrow] Transaction updated successfully");
      return tx.hash;

    } catch (error: any) {
      console.error("[useReleaseEscrow] Error:", error);
      throw error;
    } finally {
      setIsReleasing(false);
    }
  };

  return {
    releaseEscrow,
    isReleasing
  };
}
