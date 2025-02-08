
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
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "function transactionCount() view returns (uint256)"
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

      // Récupérer les détails de la transaction depuis Supabase
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .maybeSingle();

      if (txError || !transaction) {
        console.error('Error fetching transaction:', txError);
        throw new Error("Transaction non trouvée");
      }

      console.log('Transaction data from database:', transaction);

      // Vérification plus stricte de l'ID blockchain
      if (!transaction.blockchain_txn_id || 
          transaction.blockchain_txn_id === "0" || 
          transaction.blockchain_txn_id === "") {
        throw new Error("La transaction n'a pas encore été enregistrée sur la blockchain");
      }

      // Convertir l'ID en nombre et vérifier sa validité
      const txnId = Number(transaction.blockchain_txn_id);
      if (isNaN(txnId) || txnId <= 0) {
        throw new Error("ID de transaction blockchain invalide");
      }

      // Se connecter au wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      // Vérifier que l'utilisateur est l'acheteur
      if (!isUserBuyer) {
        throw new Error("Seul l'acheteur peut libérer les fonds");
      }

      // Initialiser le contrat
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // Vérifier l'état de la transaction sur la blockchain
      const txData = await contract.transactions(txnId);
      console.log('Blockchain transaction data:', txData);

      if (!txData.isFunded) {
        throw new Error("Les fonds n'ont pas été déposés pour cette transaction");
      }

      if (txData.isCompleted) {
        throw new Error("Les fonds ont déjà été libérés");
      }

      if (txData.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("Vous n'êtes pas l'acheteur de cette transaction");
      }

      // Estimer le gas avec une marge de sécurité importante
      const gasEstimate = await contract.estimateGas.releaseFunds(txnId);
      const gasLimit = gasEstimate.mul(150).div(100); // +50% marge
      const gasPrice = await provider.getGasPrice();
      const adjustedGasPrice = gasPrice.mul(120).div(100); // +20% sur le prix du gas

      console.log('Gas settings:', {
        estimatedGas: gasEstimate.toString(),
        adjustedGasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        adjustedGasPrice: adjustedGasPrice.toString()
      });

      // Envoyer la transaction
      const tx = await contract.releaseFunds(txnId, {
        gasLimit,
        gasPrice: adjustedGasPrice
      });
      console.log('Release funds transaction sent:', tx.hash);

      // Attendre la confirmation
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        // Mettre à jour la base de données
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            buyer_confirmation: true,
            status: 'completed',
            escrow_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés au vendeur.",
        });
      } else {
        throw new Error("La libération des fonds a échoué");
      }
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      let errorMessage = error.message || "Une erreur est survenue lors de la libération des fonds";
      
      // Messages d'erreur plus spécifiques
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = "Erreur d'estimation du gas. La transaction n'est peut-être pas valide.";
      } else if (error.message.includes('user rejected')) {
        errorMessage = "Transaction rejetée par l'utilisateur";
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = "Fonds insuffisants pour payer les frais de transaction";
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
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          {isLoading ? "Libération des fonds en cours..." : "Confirmer la réception"}
        </Button>
      )}
    </div>
  );
}
