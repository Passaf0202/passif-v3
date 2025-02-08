
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
    // Générer un petit nombre basé sur les derniers caractères de l'UUID
    const lastPart = uuid.split('-').pop() || '';
    const num = parseInt(lastPart.substring(0, 4), 16);
    console.log('Generated blockchain txn ID from UUID:', num);
    return num.toString();
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
      }

      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (!transaction) {
        throw new Error("Transaction non trouvée");
      }

      console.log('Transaction details:', transaction);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // Récupérer ou générer l'ID de transaction blockchain
      let blockchainTxnId = transaction.blockchain_txn_id;
      if (!blockchainTxnId) {
        blockchainTxnId = generateBlockchainTxnId(transaction.id);
        
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            blockchain_txn_id: blockchainTxnId,
            smart_contract_address: ESCROW_CONTRACT_ADDRESS
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error('Error updating transaction:', updateError);
          throw new Error("Erreur lors de la mise à jour de la transaction");
        }
      }

      console.log('Using blockchain transaction ID:', blockchainTxnId);

      // Récupérer l'adresse du signataire
      const signerAddress = await signer.getAddress();
      console.log('Signer address:', signerAddress);

      // Vérifier l'état de la transaction avant confirmation
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
        if (error.message.includes("invalid BigNumber")) {
          console.error('Invalid transaction ID error:', blockchainTxnId);
          throw new Error("ID de transaction invalide ou transaction non trouvée sur la blockchain");
        }
        throw error;
      }

      console.log('Calling confirmTransaction with ID:', blockchainTxnId);
      const tx = await contract.confirmTransaction(blockchainTxnId, {
        gasLimit: ethers.utils.hexlify(500000)
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
