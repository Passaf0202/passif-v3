
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

      if (!transaction.blockchain_txn_id) {
        throw new Error("ID de transaction blockchain non trouvé");
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

      console.log("Using blockchain transaction ID:", transaction.blockchain_txn_id);

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

      // 3. Conversion de l'ID de transaction en BigNumber
      let txnId;
      try {
        txnId = ethers.BigNumber.from(transaction.blockchain_txn_id);
        console.log("Transaction ID as BigNumber:", txnId.toString());
      } catch (error) {
        console.error("Error converting transaction ID:", error);
        throw new Error("ID de transaction invalide");
      }

      // 4. Vérification de la transaction sur la blockchain
      try {
        const txnData = await contract.getTransaction(txnId);
        console.log("Transaction data from blockchain:", txnData);
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }

      // 5. Estimation du gaz avec une marge de sécurité
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.confirmTransaction(txnId);
        console.log("Gas estimate:", gasEstimate.toString());
        // Ajouter 20% de marge de sécurité
        gasEstimate = gasEstimate.mul(120).div(100);
      } catch (error) {
        console.error("Gas estimation error:", error);
        throw new Error("Impossible d'estimer les frais de gaz");
      }

      // 6. Envoi de la transaction avec les paramètres optimisés
      console.log("Sending transaction with gas limit:", gasEstimate.toString());
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
