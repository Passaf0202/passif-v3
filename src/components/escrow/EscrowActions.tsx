
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

      // Debug détaillé des adresses et des IDs
      console.log("[EscrowActions] Transaction details:", {
        id: transactionId,
        blockchain_txn_id: transaction.blockchain_txn_id,
        user_id: user.id,
        buyer_id: transaction.buyer?.id,
        seller_id: transaction.seller?.id,
        seller_wallet_address: transaction.seller_wallet_address,
        funds_secured: transaction.funds_secured,
        buyer_confirmation: transaction.buyer_confirmation,
        seller_confirmation: transaction.seller_confirmation
      });

      // 2. Vérifier et changer de réseau si nécessaire
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

      // 3. Initialisation du provider et du contrat
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log("[EscrowActions] Connected with address:", signerAddress);

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // 4. Récupérer l'ID de transaction blockchain
      if (!transaction.blockchain_txn_id) {
        throw new Error("ID de transaction blockchain manquant");
      }

      const txnId = Number(transaction.blockchain_txn_id);
      console.log("[EscrowActions] Using blockchain transaction ID:", txnId);

      // 5. Vérifier la transaction sur la blockchain
      try {
        const [buyer, seller, amount, isFunded, isCompleted] = await contract.transactions(txnId);
        console.log("[EscrowActions] Transaction details from blockchain:", {
          buyer,
          seller,
          amount: ethers.utils.formatEther(amount),
          isFunded,
          isCompleted,
          signerAddress
        });

        if (!isFunded) {
          throw new Error("La transaction n'est pas financée sur la blockchain");
        }

        if (isCompleted) {
          throw new Error("La transaction est déjà complétée sur la blockchain");
        }

        // Vérifier que les adresses correspondent
        if (seller.toLowerCase() !== transaction.seller_wallet_address?.toLowerCase()) {
          console.error("[EscrowActions] Seller address mismatch:", {
            onChain: seller,
            inDb: transaction.seller_wallet_address
          });
          throw new Error("Adresse du vendeur incohérente");
        }
      } catch (error: any) {
        console.error("[EscrowActions] Error checking transaction on blockchain:", error);
        if (error.message.includes("execution reverted")) {
          throw new Error("La transaction n'existe pas sur la blockchain avec cet ID");
        }
        throw error;
      }

      // 6. Estimer le gaz avec une marge de sécurité
      let gasEstimate;
      try {
        console.log("[EscrowActions] Estimating gas for releaseFunds with txnId:", txnId);
        gasEstimate = await contract.estimateGas.releaseFunds(txnId);
        console.log("[EscrowActions] Gas estimate:", gasEstimate.toString());
        gasEstimate = gasEstimate.mul(120).div(100); // +20% marge
      } catch (error: any) {
        console.error("[EscrowActions] Gas estimation error:", error);
        throw new Error("Impossible d'estimer les frais de transaction");
      }

      // 7. Envoyer la transaction
      console.log("[EscrowActions] Releasing funds for transaction ID:", txnId);
      const tx = await contract.releaseFunds(txnId, {
        gasLimit: gasEstimate
      });
      
      console.log("[EscrowActions] Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("[EscrowActions] Transaction receipt:", receipt);

      if (receipt.status === 1) {
        // 8. Mettre à jour la base de données
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            buyer_confirmation: true,
            seller_confirmation: true,
            status: 'completed',
            escrow_status: 'completed',
            updated_at: new Date().toISOString()
          })
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
      console.error('[EscrowActions] Error releasing funds:', error);
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
