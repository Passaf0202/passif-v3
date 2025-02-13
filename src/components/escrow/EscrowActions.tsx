
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

      // 1. Vérifications préliminaires
      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }

      if (!transaction.funds_secured) {
        throw new Error("Les fonds ne sont pas encore sécurisés");
      }

      console.log("Transaction details:", {
        id: transactionId,
        blockchain_txn_id: transaction.blockchain_txn_id,
        user_id: user.id,
        buyer_id: transaction.buyer?.id,
        seller_id: transaction.seller?.id,
        funds_secured: transaction.funds_secured,
        buyer_confirmation: transaction.buyer_confirmation,
        seller_confirmation: transaction.seller_confirmation
      });

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
      const signerAddress = await signer.getAddress();
      console.log("Connected with address:", signerAddress);

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // 3. Récupérer les détails de la transaction blockchain
      const txnId = Number(transaction.blockchain_txn_id);
      console.log("Using transaction ID:", txnId);

      // Vérifier la transaction sur la blockchain
      const txnOnChain = await contract.transactions(txnId);
      console.log("Transaction on chain:", {
        buyer: txnOnChain.buyer,
        seller: txnOnChain.seller,
        amount: txnOnChain.amount.toString(),
        isFunded: txnOnChain.isFunded,
        isCompleted: txnOnChain.isCompleted
      });

      // 4. Estimer le gaz
      let gasEstimate;
      try {
        console.log("Estimating gas for releaseFunds with txnId:", txnId);
        gasEstimate = await contract.estimateGas.releaseFunds(txnId);
        console.log("Gas estimate:", gasEstimate.toString());
        gasEstimate = gasEstimate.mul(120).div(100); // +20% marge
      } catch (error: any) {
        console.error("Gas estimation error:", error);
        // Afficher plus de détails sur l'erreur
        if (error.error?.message) {
          console.error("Error message:", error.error.message);
        }
        if (error.error?.data?.message) {
          console.error("Error data message:", error.error.data.message);
        }
        throw new Error(error.error?.message || error.message || "Impossible d'estimer les frais de transaction");
      }

      // 5. Envoyer la transaction
      console.log("Releasing funds for transaction ID:", txnId);
      const tx = await contract.releaseFunds(txnId, {
        gasLimit: gasEstimate
      });
      
      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt.status === 1) {
        const updates: any = {
          updated_at: new Date().toISOString(),
          status: 'completed',
          escrow_status: 'completed',
          buyer_confirmation: true,
          seller_confirmation: true
        };

        const { error: updateError } = await supabase
          .from('transactions')
          .update(updates)
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés avec succès",
        });

        onRelease();
      } else {
        throw new Error("La libération des fonds a échoué sur la blockchain");
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
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
          Libération des fonds en cours...
        </>
      ) : canConfirmTransaction ? (
        "Libérer les fonds au vendeur"
      ) : (
        "En attente de confirmation"
      )}
    </Button>
  );
}
