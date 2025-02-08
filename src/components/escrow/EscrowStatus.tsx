
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";

const ESCROW_ABI = [
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

interface EscrowStatusProps {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  currentUserId: string;
}

export function EscrowStatus({
  transactionId,
  buyerId,
  sellerId,
  currentUserId,
}: EscrowStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isUserBuyer = currentUserId === buyerId;
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const generateBlockchainTxnId = (uuid: string): string => {
    // Convertir l'UUID en un petit nombre entier pour le smart contract
    const numericId = parseInt(uuid.replace(/-/g, '').substring(0, 6), 16);
    return numericId.toString();
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      // S'assurer qu'on est sur le bon réseau
      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
      }

      // Récupérer les détails de la transaction
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (!transaction) {
        throw new Error("Transaction non trouvée");
      }

      console.log('Transaction details:', transaction);

      // Connecter au smart contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // Générer ou utiliser l'ID de transaction blockchain
      const blockchainTxnId = transaction.blockchain_txn_id || generateBlockchainTxnId(transaction.id);
      console.log('Using blockchain transaction ID:', blockchainTxnId);

      if (!transaction.blockchain_txn_id) {
        // Mettre à jour la transaction avec l'ID blockchain
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            blockchain_txn_id: blockchainTxnId,
            smart_contract_address: ESCROW_CONTRACT_ADDRESS
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error('Error updating transaction:', updateError);
        }
      }

      // Vérifier l'état de la transaction avant confirmation
      const txnState = await contract.getTransaction(blockchainTxnId);
      console.log('Transaction state:', txnState);

      // Confirmer la transaction sur la blockchain avec un gas limit explicite
      console.log('Confirming blockchain transaction:', blockchainTxnId);
      const tx = await contract.confirmTransaction(blockchainTxnId, {
        gasLimit: ethers.utils.hexlify(500000) // Gas limit plus élevé
      });
      console.log('Confirmation transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Confirmation receipt:', receipt);

      if (receipt.status === 1) {
        const { error } = await supabase
          .from('transactions')
          .update({
            buyer_confirmation: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (error) throw error;

        toast({
          title: "Transaction confirmée",
          description: "La transaction a été confirmée avec succès.",
        });
      } else {
        throw new Error("La confirmation sur la blockchain a échoué");
      }
    } catch (error: any) {
      console.error("Error confirming transaction:", error);
      let errorMessage = "Une erreur est survenue lors de la confirmation";
      
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = "Erreur d'estimation du gas. Essayez d'augmenter la limite.";
      } else if (error.message.includes('execution reverted')) {
        errorMessage = "La transaction a été rejetée par le contrat. Vérifiez les paramètres.";
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          {isUserBuyer
            ? "En tant qu'acheteur, vous pouvez confirmer la réception de l'article pour libérer les fonds."
            : "En tant que vendeur, vous recevrez les fonds une fois que l'acheteur aura confirmé la réception."}
        </AlertDescription>
      </Alert>

      {isUserBuyer && (
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full"
        >
          Confirmer la réception
        </Button>
      )}
    </div>
  );
}
