
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
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)"
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Mettre à jour le statut des fonds sécurisés
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .update({
          funds_secured: true,
          funds_secured_at: new Date().toISOString(),
          escrow_status: 'funded',
          status: 'processing'
        })
        .eq('id', transactionId)
        .select('blockchain_txn_id, funds_secured, status')
        .single();

      if (txError || !transaction) {
        console.error('Error updating transaction:', txError);
        throw new Error("Transaction non trouvée");
      }

      console.log('Transaction data:', transaction);

      // Vérifier le statut et les fonds de la transaction
      if (transaction.status === 'completed') {
        throw new Error("Cette transaction a déjà été complétée");
      }

      // Convertir et valider l'ID de transaction blockchain
      const txnId = transaction.blockchain_txn_id === '0' ? 
        null : 
        Number(transaction.blockchain_txn_id);

      if (!txnId || isNaN(txnId)) {
        console.error('Invalid blockchain transaction ID:', transaction.blockchain_txn_id);
        throw new Error("ID de transaction blockchain invalide");
      }

      console.log('Using blockchain transaction ID:', txnId);

      // Se connecter au wallet et au contrat
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      // Vérifier que l'utilisateur est bien l'acheteur
      if (isUserBuyer === false) {
        throw new Error("Seul l'acheteur peut libérer les fonds");
      }
      
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // Vérifier que la transaction existe dans le contrat
      try {
        const txData = await contract.getTransaction(txnId);
        console.log('Transaction data from contract:', txData);
        
        if (!txData.amount.gt(0)) {
          throw new Error("Transaction non trouvée dans le contrat");
        }

        // Vérifier que l'utilisateur est bien l'acheteur de la transaction
        if (txData.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
          throw new Error("Vous n'êtes pas l'acheteur de cette transaction");
        }

        if (txData.fundsReleased) {
          throw new Error("Les fonds ont déjà été libérés");
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
        throw new Error("Impossible de vérifier la transaction dans le contrat");
      }

      // Estimer le gas avec une marge de sécurité
      const gasEstimate = await contract.estimateGas.releaseFunds(txnId);
      console.log('Estimated gas:', gasEstimate.toString());
      const gasLimit = gasEstimate.mul(120).div(100); // +20% de marge
      console.log('Gas limit with 20% margin:', gasLimit.toString());

      // Envoyer la transaction
      const tx = await contract.releaseFunds(txnId, {
        gasLimit: gasLimit
      });
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        // Mettre à jour Supabase
        const { error } = await supabase
          .from('transactions')
          .update({
            buyer_confirmation: true,
            status: 'completed',
            escrow_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (error) throw error;

        toast({
          title: "Confirmation réussie",
          description: "Les fonds ont été libérés au vendeur.",
        });
      } else {
        throw new Error("La libération des fonds a échoué");
      }
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      let errorMessage = "Une erreur est survenue lors de la libération des fonds";
      
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = "Erreur d'estimation du gas. La transaction n'est peut-être pas valide.";
      } else if (error.message.includes('execution reverted')) {
        errorMessage = "Transaction rejetée : vérifiez que vous êtes bien l'acheteur et que la transaction existe.";
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = "Fonds insuffisants pour payer les frais de transaction.";
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
          {isLoading ? "Libération des fonds en cours..." : "Confirmer la réception"}
        </Button>
      )}
    </div>
  );
}
