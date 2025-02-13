
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { ethers } from "ethers";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "./types/escrow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Transaction } from "./types/escrow";
import { useAuth } from "@/hooks/useAuth";

interface EscrowActionsProps {
  transaction: Transaction;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onRelease: () => void;
  transactionId: string;
}

export function EscrowActions({ 
  transaction, 
  isLoading, 
  setIsLoading, 
  onRelease,
  transactionId 
}: EscrowActionsProps) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { toast } = useToast();
  const { user } = useAuth();

  const canConfirmTransaction = transaction.funds_secured && 
    !transaction.buyer_confirmation && 
    (user?.id === transaction.buyer?.id || user?.id === transaction.seller?.id);

  const findTransactionIdFromEvents = async (contract: ethers.Contract, transactionHash: string) => {
    try {
      const filter = contract.filters.TransactionCreated();
      const currentBlock = await contract.provider.getBlockNumber();
      const startBlock = Math.max(0, currentBlock - 10000);
      
      console.log("Searching for events from block", startBlock, "to", currentBlock);
      const events = await contract.queryFilter(filter, startBlock, currentBlock);
      
      console.log("Found TransactionCreated events:", events);
      
      for (const event of events) {
        if (event.transactionHash.toLowerCase() === transactionHash.toLowerCase()) {
          console.log("Found matching transaction with ID:", event.args?.txnId.toString());
          return {
            txnId: event.args?.txnId,
            blockNumber: event.blockNumber
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error finding transaction ID from events:", error);
      return null;
    }
  };

  const verifyBlockchainTransaction = async (contract: ethers.Contract) => {
    try {
      console.log("Verifying transaction status on blockchain");
      const txnStatus = await contract.getStatus();
      console.log("Transaction status from blockchain:", txnStatus);

      if (txnStatus._fundsReleased) {
        throw new Error("Les fonds ont déjà été libérés");
      }

      return txnStatus;
    } catch (error) {
      console.error("Error verifying blockchain transaction:", error);
      throw new Error("La transaction n'est pas valide sur la blockchain");
    }
  };

  const handleConfirmTransaction = async () => {
    try {
      setIsLoading(true);

      // 1. Vérifications préliminaires
      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }

      if (!transaction.funds_secured) {
        throw new Error("Les fonds ne sont pas encore sécurisés");
      }

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

      // 2. Initialisation du contrat avec le provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log("Signer address:", signerAddress);

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // 3. Rechercher le vrai ID de transaction
      let realTxnId: ethers.BigNumber;
      let transactionInfo = null;

      if (transaction.transaction_hash) {
        console.log("Searching for transaction ID using hash:", transaction.transaction_hash);
        transactionInfo = await findTransactionIdFromEvents(contract, transaction.transaction_hash);
      }

      if (transactionInfo) {
        realTxnId = transactionInfo.txnId;
        console.log("Found real transaction ID:", realTxnId.toString());
        
        // Mettre à jour la base de données avec le bon ID et le numéro de bloc
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            blockchain_txn_id: realTxnId.toString(),
            block_number: transactionInfo.blockNumber
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error("Error updating transaction data:", updateError);
        }
      } else {
        console.log("Using stored blockchain_txn_id as fallback");
        if (!transaction.blockchain_txn_id) {
          throw new Error("ID de transaction introuvable");
        }
        realTxnId = ethers.BigNumber.from(transaction.blockchain_txn_id);
      }

      // 4. Vérifier la transaction sur la blockchain
      const txnStatus = await verifyBlockchainTransaction(contract);
      console.log("Transaction status verified:", txnStatus);

      // 5. Estimation du gaz avec une marge de sécurité
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.confirmTransaction(realTxnId);
        console.log("Gas estimate:", gasEstimate.toString());
        // Ajouter 20% de marge de sécurité
        gasEstimate = gasEstimate.mul(120).div(100);
      } catch (error) {
        console.error("Gas estimation error:", error);
        
        // Marquer la transaction comme ayant échoué si on ne peut pas l'estimer
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'failed',
            escrow_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error("Error updating transaction status:", updateError);
        }

        throw new Error("Impossible de confirmer la transaction. Elle n'est peut-être plus valide sur la blockchain.");
      }

      // 6. Envoi de la transaction avec les paramètres optimisés
      console.log("Sending transaction with gas limit:", gasEstimate.toString());
      const tx = await contract.confirmTransaction(realTxnId, {
        gasLimit: gasEstimate
      });
      
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt.status === 1) {
        const updates: any = {
          updated_at: new Date().toISOString()
        };

        // Mettre à jour la confirmation en fonction de l'utilisateur
        if (user.id === transaction.buyer?.id) {
          updates.buyer_confirmation = true;
        } else if (user.id === transaction.seller?.id) {
          updates.seller_confirmation = true;
        }

        // Si les deux ont confirmé, marquer comme complété
        if (
          (updates.buyer_confirmation && transaction.seller_confirmation) ||
          (updates.seller_confirmation && transaction.buyer_confirmation)
        ) {
          updates.status = 'completed';
          updates.escrow_status = 'completed';
        }

        const { error: updateError } = await supabase
          .from('transactions')
          .update(updates)
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Transaction confirmée avec succès",
        });

        onRelease();
      } else {
        throw new Error("La transaction a échoué sur la blockchain");
      }
    } catch (error: any) {
      console.error('Error confirming transaction:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (transaction?.escrow_status === 'completed') {
    return null;
  }

  return (
    <Button
      onClick={handleConfirmTransaction}
      disabled={isLoading || !canConfirmTransaction}
      className="w-full bg-purple-500 hover:bg-purple-600"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Confirmation en cours...
        </>
      ) : canConfirmTransaction ? (
        "Confirmer et libérer les fonds"
      ) : (
        "En attente de confirmation"
      )}
    </Button>
  );
}
