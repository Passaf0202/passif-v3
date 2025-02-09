
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { useEscrowContract } from "./useEscrowContract";

export function useFundsRelease(transactionId: string, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { getActiveContract, getContract } = useEscrowContract();

  const handleReleaseFunds = async () => {
    try {
      setIsLoading(true);

      // Vérifier et changer de réseau si nécessaire
      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Récupérer les détails de la transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (txError || !transaction) {
        throw new Error("Transaction non trouvée");
      }

      const activeContract = await getActiveContract();
      console.log('Active contract:', activeContract);
      
      if (!activeContract?.address) {
        throw new Error("Contrat intelligent non trouvé");
      }

      const contract = await getContract(activeContract.address);
      const txnId = Number(transaction.blockchain_txn_id);
      console.log('Transaction ID:', txnId);

      // Envoyer la transaction de confirmation
      const tx = await contract.confirmTransaction(txnId);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        // Mettre à jour le statut dans la base de données
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            escrow_status: 'completed',
            released_at: new Date().toISOString(),
            transaction_confirmed_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés au vendeur avec succès.",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error("La transaction a échoué");
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleReleaseFunds
  };
}
