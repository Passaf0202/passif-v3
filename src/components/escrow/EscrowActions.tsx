
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

  const handleConfirmTransaction = async () => {
    try {
      setIsLoading(true);

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

      if (!transaction.blockchain_txn_id) {
        throw new Error("ID de transaction blockchain non trouvé");
      }

      console.log("Using blockchain transaction ID:", transaction.blockchain_txn_id);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      const txnId = Number(transaction.blockchain_txn_id);
      if (isNaN(txnId)) {
        throw new Error("L'ID de transaction n'est pas un nombre valide");
      }

      console.log("Calling confirmTransaction with ID:", txnId);
      const tx = await contract.confirmTransaction(txnId);
      console.log("Confirm transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt.status === 1) {
        const updates: any = {
          updated_at: new Date().toISOString()
        };

        // Mettre à jour la confirmation en fonction de l'utilisateur
        if (user?.id === transaction.buyer?.id) {
          updates.buyer_confirmation = true;
        } else if (user?.id === transaction.seller?.id) {
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
