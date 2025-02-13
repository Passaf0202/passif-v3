
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
      console.log("Looking for transaction with hash:", transactionHash);
      
      // Obtenir le bloc actuel
      const currentBlock = await contract.provider.getBlockNumber();
      console.log("Current block:", currentBlock);

      // Chercher d'abord dans les 100 derniers blocs
      const startBlock = currentBlock - 100;
      const endBlock = currentBlock;
      
      console.log(`Searching blocks ${startBlock} to ${endBlock}`);
      
      // Chercher tous les événements TransactionCreated
      const filter = contract.filters.TransactionCreated();
      const events = await contract.queryFilter(filter, startBlock, endBlock);
      
      console.log(`Found ${events.length} events in this range`);

      // Chercher notre hash spécifique
      for (const event of events) {
        if (event.transactionHash.toLowerCase() === transactionHash.toLowerCase()) {
          const txnId = event.args?.txnId;
          console.log("Found matching event with txnId:", txnId.toString());
          
          // Vérifier que la transaction existe toujours
          try {
            const txData = await contract.getTransaction(txnId);
            if (txData && !txData.amount.eq(0)) {
              // Mettre à jour le block_number et le sequence_number dans Supabase
              await supabase
                .from('transactions')
                .update({
                  block_number: event.blockNumber,
                  blockchain_sequence_number: txnId.toNumber(),
                  blockchain_txn_id: txnId.toString() // Mettre à jour aussi le blockchain_txn_id
                })
                .eq('id', transactionId);

              return {
                txnId,
                blockNumber: event.blockNumber,
                isValid: true
              };
            }
          } catch (error) {
            console.log("Error checking transaction data:", error);
          }
        }
      }

      // Si on ne trouve pas dans les 100 derniers blocs, élargir la recherche
      if (events.length === 0) {
        const extendedStartBlock = currentBlock - 500;
        console.log(`Extending search to blocks ${extendedStartBlock} to ${startBlock}`);
        
        const extendedEvents = await contract.queryFilter(filter, extendedStartBlock, startBlock);
        for (const event of extendedEvents) {
          if (event.transactionHash.toLowerCase() === transactionHash.toLowerCase()) {
            const txnId = event.args?.txnId;
            console.log("Found matching event in extended search with txnId:", txnId.toString());
            
            try {
              const txData = await contract.getTransaction(txnId);
              if (txData && !txData.amount.eq(0)) {
                await supabase
                  .from('transactions')
                  .update({
                    block_number: event.blockNumber,
                    blockchain_sequence_number: txnId.toNumber(),
                    blockchain_txn_id: txnId.toString()
                  })
                  .eq('id', transactionId);

                return {
                  txnId,
                  blockNumber: event.blockNumber,
                  isValid: true
                };
              }
            } catch (error) {
              console.log("Error checking transaction data in extended search:", error);
            }
          }
        }
      }

      console.log("Transaction not found in any of the search ranges");
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

      return txData;
    } catch (error) {
      console.error("Error verifying transaction:", error);
      throw error;
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
      console.log("Connected with address:", await signer.getAddress());

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // 3. Trouver l'ID réel de la transaction en utilisant uniquement le hash
      if (!transaction.transaction_hash) {
        throw new Error("Hash de transaction manquant");
      }

      const result = await findRealTransactionId(contract, transaction.transaction_hash);
      if (!result.isValid || !result.txnId) {
        throw new Error("Impossible de trouver la transaction sur la blockchain");
      }

      const realTxnId = result.txnId;
      console.log("Found real transaction ID:", realTxnId.toString());

      // 4. Vérifier la transaction
      await verifyBlockchainTransaction(contract, realTxnId);

      // 5. Estimer le gaz
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.confirmTransaction(realTxnId);
        console.log("Gas estimate:", gasEstimate.toString());
        gasEstimate = gasEstimate.mul(120).div(100); // +20% marge
      } catch (error) {
        console.error("Gas estimation error:", error);
        throw new Error("Impossible d'estimer les frais de transaction");
      }

      // 6. Envoyer la transaction
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
