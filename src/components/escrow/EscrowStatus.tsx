
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
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

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
      }

      // Récupérer les détails de la transaction depuis Supabase
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (txError || !transaction) {
        console.error('Error fetching transaction:', txError);
        throw new Error("Transaction non trouvée");
      }

      if (!transaction.blockchain_txn_id) {
        console.error('No blockchain transaction ID found');
        throw new Error("ID de transaction blockchain manquant");
      }

      const blockchainTxnId = transaction.blockchain_txn_id;
      console.log('Using blockchain transaction ID:', blockchainTxnId);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log('Signer address:', signerAddress);

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // Vérifier l'état de la transaction sur la blockchain
      try {
        const txnState = await contract.getTransaction(blockchainTxnId);
        console.log('Transaction state on blockchain:', txnState);

        if (txnState.fundsReleased) {
          throw new Error("Les fonds ont déjà été libérés pour cette transaction");
        }

        // Vérifier que le signataire est bien l'acheteur
        if (txnState.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
          console.error('Signer is not the buyer:', {
            signer: signerAddress,
            buyer: txnState.buyer
          });
          throw new Error("Vous n'êtes pas l'acheteur de cette transaction");
        }

      } catch (error: any) {
        console.error('Error checking transaction state:', error);
        if (error.message.includes("invalid BigNumber")) {
          throw new Error("Transaction introuvable sur la blockchain");
        }
        throw error;
      }

      // Appeler releaseFunds avec le bon ID
      console.log('Calling releaseFunds with ID:', blockchainTxnId);
      const tx = await contract.releaseFunds(blockchainTxnId, {
        gasLimit: ethers.utils.hexlify(500000)
      });

      console.log('Release funds transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Release funds receipt:', receipt);

      if (receipt.status === 1) {
        // Mettre à jour le statut dans Supabase
        const { error } = await supabase
          .from('transactions')
          .update({
            buyer_confirmation: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (error) throw error;

        toast({
          title: "Fonds libérés",
          description: "Les fonds ont été libérés avec succès au vendeur.",
        });
      } else {
        throw new Error("La libération des fonds sur la blockchain a échoué");
      }
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      let errorMessage = "Une erreur est survenue lors de la libération des fonds";
      
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = "Erreur d'estimation du gas. Essayez d'augmenter la limite.";
      } else if (error.message.includes('execution reverted')) {
        errorMessage = "Transaction rejetée : vérifiez que vous êtes bien l'acheteur et que la transaction existe sur la blockchain.";
      } else {
        errorMessage = error.message || errorMessage;
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

