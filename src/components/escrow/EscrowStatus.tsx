
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
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)"
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

      // Récupérer la transaction depuis Supabase
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('blockchain_txn_id, status')
        .eq('id', transactionId)
        .single();

      if (txError || !transaction) {
        console.error('Error fetching transaction:', txError);
        throw new Error("Transaction non trouvée");
      }

      if (!transaction.blockchain_txn_id) {
        throw new Error("ID de transaction blockchain manquant");
      }

      // Convertir et valider l'ID de transaction blockchain
      const txnId = Number(transaction.blockchain_txn_id);
      if (isNaN(txnId)) {
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
      if (!isUserBuyer) {
        throw new Error("Seul l'acheteur peut libérer les fonds");
      }
      
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // Vérifier que la transaction existe dans le contrat
      const txData = await contract.transactions(txnId);
      console.log('Transaction data from contract:', txData);
      
      if (!txData.amount.gt(0)) {
        throw new Error("Transaction non trouvée dans le contrat");
      }

      // Vérifier que l'utilisateur est bien l'acheteur de la transaction
      if (txData.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("Vous n'êtes pas l'acheteur de cette transaction");
      }

      // Vérifier que la transaction n'est pas déjà complétée
      if (txData.isCompleted) {
        throw new Error("Les fonds ont déjà été libérés");
      }

      // Vérifier que les fonds sont bien déposés
      if (!txData.isFunded) {
        throw new Error("Les fonds n'ont pas été déposés pour cette transaction");
      }

      // Estimer le gas
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
