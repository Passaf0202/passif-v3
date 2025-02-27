
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { TransactionError, TransactionErrorCodes } from "@/utils/escrow/transactionErrors";
import { useAccount } from 'wagmi';

// ABI du contrat d'escrow pour la fonction releaseEscrow
const ESCROW_ABI = [
  "function releaseEscrow(uint256 txnId) external",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export function useReleaseEscrow() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { ensureCorrectNetwork } = useNetworkSwitch();
  const { isConnected } = useAccount();

  const releaseEscrow = async (blockchainTxnId: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log('[useReleaseEscrow] Starting release process for transaction:', blockchainTxnId);

      // Vérifier que l'utilisateur est bien connecté à son wallet
      if (!isConnected) {
        throw new TransactionError(
          "Veuillez connecter votre portefeuille pour libérer les fonds",
          TransactionErrorCodes.NOT_CONNECTED
        );
      }

      // S'assurer d'être sur le bon réseau
      await ensureCorrectNetwork();

      // Initialiser le provider Ethereum
      let provider;
      if (typeof window !== 'undefined' && window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        throw new TransactionError(
          "Impossible d'initialiser le provider. Veuillez vous connecter à votre wallet.",
          TransactionErrorCodes.PROVIDER_ERROR
        );
      }

      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // Convertir l'ID blockchain en nombre
      const txnId = Number(blockchainTxnId);
      if (isNaN(txnId)) {
        throw new TransactionError(
          "ID de transaction blockchain invalide",
          TransactionErrorCodes.INVALID_BLOCKCHAIN_ID
        );
      }

      // Vérifier si l'utilisateur est bien le buyer de la transaction
      const txDetails = await contract.transactions(txnId);
      const currentAddress = await signer.getAddress();
      
      if (currentAddress.toLowerCase() !== txDetails.buyer.toLowerCase()) {
        throw new TransactionError(
          "Seul l'acheteur peut libérer les fonds",
          TransactionErrorCodes.UNAUTHORIZED
        );
      }

      if (txDetails.isCompleted) {
        throw new TransactionError(
          "Cette transaction a déjà été complétée",
          TransactionErrorCodes.ALREADY_COMPLETED
        );
      }

      // Estimer le gas nécessaire
      const gasEstimate = await contract.estimateGas.releaseEscrow(txnId);
      // Ajouter une marge de 20% pour éviter les échecs de transaction
      const gasLimit = gasEstimate.mul(120).div(100);

      // Exécuter la transaction de libération
      console.log(`[useReleaseEscrow] Executing releaseEscrow for txnId: ${txnId}`);
      const tx = await contract.releaseEscrow(txnId, { gasLimit });
      console.log(`[useReleaseEscrow] Transaction hash: ${tx.hash}`);

      // Attendre la confirmation de la transaction
      const receipt = await tx.wait();
      console.log(`[useReleaseEscrow] Transaction receipt:`, receipt);

      if (receipt.status !== 1) {
        throw new TransactionError(
          "La transaction blockchain a échoué",
          TransactionErrorCodes.BLOCKCHAIN_ERROR
        );
      }

      // Mettre à jour le statut dans Supabase
      await updateTransactionStatus(blockchainTxnId);

      toast({
        title: "Succès",
        description: "Les fonds ont été libérés au vendeur avec succès",
      });

      return receipt;

    } catch (error: any) {
      console.error('[useReleaseEscrow] Error:', error);
      
      if (error instanceof TransactionError) {
        setError(error.message);
        toast({
          title: "Erreur de transaction",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const errorMessage = error.message || "Une erreur est survenue lors de la libération des fonds";
        setError(errorMessage);
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour mettre à jour le statut de la transaction dans Supabase
  const updateTransactionStatus = async (blockchainTxnId: string) => {
    try {
      // Trouver la transaction à mettre à jour
      const { data: transactions, error: findError } = await supabase
        .from('transactions')
        .select('id')
        .eq('blockchain_txn_id', blockchainTxnId);

      if (findError || !transactions || transactions.length === 0) {
        console.error('[useReleaseEscrow] Error finding transaction:', findError);
        throw new Error("Transaction non trouvée dans la base de données");
      }

      const transactionId = transactions[0].id;

      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          escrow_status: 'completed',
          funds_released: true,
          funds_released_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error('[useReleaseEscrow] Error updating transaction:', updateError);
        throw new Error("Erreur lors de la mise à jour du statut de la transaction");
      }

      console.log('[useReleaseEscrow] Transaction status updated successfully');
    } catch (error) {
      console.error('[useReleaseEscrow] Database update error:', error);
      // On ne remonte pas cette erreur car la transaction blockchain a réussi
      // Le statut sera mis à jour lors d'une prochaine tentative ou par un job
    }
  };

  return {
    releaseEscrow,
    isProcessing,
    error
  };
}
