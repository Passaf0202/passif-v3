
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

  const findRealTransactionId = async (contract: ethers.Contract, transactionHash: string) => {
    try {
      // 1. D'abord, obtenir nextTransactionId pour savoir la plage à chercher
      const nextId = await contract.nextTransactionId();
      console.log("Current nextTransactionId:", nextId.toString());

      // 2. Chercher dans les derniers blocs
      const currentBlock = await contract.provider.getBlockNumber();
      const startBlock = Math.max(0, currentBlock - 10000); // Chercher dans les 10000 derniers blocs
      
      console.log("Searching events from block", startBlock, "to", currentBlock);
      
      const filter = contract.filters.TransactionCreated();
      const events = await contract.queryFilter(filter, startBlock, currentBlock);
      
      console.log("Found TransactionCreated events:", events.length);

      // 3. Chercher l'événement correspondant à notre hash
      for (const event of events) {
        if (event.transactionHash.toLowerCase() === transactionHash.toLowerCase()) {
          const txnId = event.args?.txnId;
          console.log("Found matching transaction. Event ID:", txnId.toString());
          
          // 4. Vérifier que cette transaction existe toujours dans le contrat
          try {
            const txData = await contract.getTransaction(txnId);
            if (txData && !txData.amount.eq(0)) {
              console.log("Transaction verified on chain:", txData);
              return {
                txnId,
                blockNumber: event.blockNumber,
                isValid: true
              };
            }
          } catch (error) {
            console.error("Error verifying transaction data:", error);
          }
        }
      }

      return { isValid: false };
    } catch (error) {
      console.error("Error in findRealTransactionId:", error);
      return { isValid: false };
    }
  };

  const verifyBlockchainTransaction = async (contract: ethers.Contract, txnId: ethers.BigNumber) => {
    try {
      console.log("Verifying transaction on chain:", txnId.toString());
      const txData = await contract.getTransaction(txnId);
      console.log("Transaction data from chain:", txData);

      if (!txData || txData.amount.eq(0)) {
        throw new Error("Transaction invalide ou expirée sur la blockchain");
      }

      if (txData.fundsReleased) {
        throw new Error("Les fonds ont déjà été libérés");
      }

      const nextId = await contract.nextTransactionId();
      if (txnId.gte(nextId)) {
        throw new Error("ID de transaction invalide");
      }

      return txData;
    } catch (error) {
      console.error("Error verifying transaction:", error);
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

      // 2. Initialisation du contrat
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log("Signer address:", signerAddress);

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // 3. Trouver l'ID réel de la transaction
      let realTxnId: ethers.BigNumber | null = null;
      let needsUpdate = false;
      let blockNumber: number | undefined;

      if (transaction.transaction_hash) {
        console.log("Searching real transaction ID using hash:", transaction.transaction_hash);
        const result = await findRealTransactionId(contract, transaction.transaction_hash);
        
        if (result.isValid && result.txnId) {
          realTxnId = result.txnId;
          blockNumber = result.blockNumber;
          needsUpdate = true;
        }
      }

      // Si on n'a pas trouvé avec le hash, essayer avec l'ID stocké
      if (!realTxnId && transaction.blockchain_txn_id) {
        try {
          const storedId = ethers.BigNumber.from(transaction.blockchain_txn_id);
          const txData = await contract.getTransaction(storedId);
          if (txData && !txData.amount.eq(0)) {
            realTxnId = storedId;
          }
        } catch (error) {
          console.error("Error checking stored transaction ID:", error);
        }
      }

      if (!realTxnId) {
        throw new Error("Impossible de trouver la transaction sur la blockchain");
      }

      // 4. Mettre à jour la base de données si nécessaire
      if (needsUpdate && blockNumber !== undefined) {
        console.log("Updating transaction with new blockchain ID:", realTxnId?.toString());
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            blockchain_txn_id: realTxnId?.toString(),
            block_number: blockNumber
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error("Error updating transaction:", updateError);
        }
      }

      // 5. Vérifier la transaction
      await verifyBlockchainTransaction(contract, realTxnId);

      // 6. Estimer le gaz
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.confirmTransaction(realTxnId);
        console.log("Gas estimate:", gasEstimate.toString());
        gasEstimate = gasEstimate.mul(120).div(100); // +20% marge
      } catch (error) {
        console.error("Gas estimation error:", error);
        throw new Error("Impossible d'estimer les frais de transaction");
      }

      // 7. Envoyer la transaction
      console.log("Confirming transaction with ID:", realTxnId.toString());
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

        if (user.id === transaction.buyer?.id) {
          updates.buyer_confirmation = true;
        } else if (user.id === transaction.seller?.id) {
          updates.seller_confirmation = true;
        }

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
