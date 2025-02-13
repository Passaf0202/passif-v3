
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

  const getTxnIdFromReceipt = async (provider: ethers.providers.Provider, txHash: string) => {
    try {
      console.log("Getting receipt for hash:", txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        throw new Error("Transaction receipt not found");
      }

      console.log("Found receipt:", receipt);

      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider);
      const txnCreatedEvent = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(event => event && event.name === "TransactionCreated");

      if (!txnCreatedEvent || !txnCreatedEvent.args) {
        throw new Error("TransactionCreated event not found in logs");
      }

      const txnId = txnCreatedEvent.args.txnId;
      console.log("Found txnId from logs:", txnId.toString());

      // Mise à jour dans Supabase
      await supabase
        .from('transactions')
        .update({
          blockchain_txn_id: txnId.toString(),
          block_number: receipt.blockNumber
        })
        .eq('id', transactionId);

      return txnId;
    } catch (error) {
      console.error("Error getting txnId from receipt:", error);
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

      if (!transaction.transaction_hash) {
        throw new Error("Hash de transaction manquant");
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

      // 2. Initialisation du provider et du contrat
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log("Connected with address:", await signer.getAddress());

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // 3. Récupérer l'ID de transaction depuis les logs
      const txnId = await getTxnIdFromReceipt(provider, transaction.transaction_hash);
      console.log("Using transaction ID:", txnId.toString());

      // 4. Estimer le gaz
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.confirmTransaction(txnId);
        console.log("Gas estimate:", gasEstimate.toString());
        gasEstimate = gasEstimate.mul(120).div(100); // +20% marge
      } catch (error) {
        console.error("Gas estimation error:", error);
        throw new Error("Impossible d'estimer les frais de transaction");
      }

      // 5. Envoyer la transaction
      console.log("Confirming transaction with ID:", txnId.toString());
      const tx = await contract.confirmTransaction(txnId, {
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
