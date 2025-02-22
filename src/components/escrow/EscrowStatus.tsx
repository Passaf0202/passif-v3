
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

      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      console.log('Connected wallet address:', signerAddress);

      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (txError || !transaction) {
        throw new Error("Transaction non trouvée");
      }

      if (!transaction.funds_secured) {
        throw new Error("Les fonds n'ont pas encore été sécurisés");
      }

      if (!transaction.blockchain_txn_id || transaction.blockchain_txn_id === "0") {
        throw new Error("Transaction blockchain non trouvée");
      }

      if (!isUserBuyer) {
        throw new Error("Seul l'acheteur peut libérer les fonds");
      }

      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
      const txnId = Number(transaction.blockchain_txn_id);
      const txData = await contract.transactions(txnId);

      if (txData.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("Adresse de wallet incorrecte");
      }

      if (!txData.isFunded) {
        throw new Error("Les fonds n'ont pas été déposés");
      }

      if (txData.isCompleted) {
        throw new Error("Les fonds ont déjà été libérés");
      }

      const gasEstimate = await contract.estimateGas.releaseFunds(txnId);
      const gasLimit = gasEstimate.mul(150).div(100);
      const gasPrice = await provider.getGasPrice();
      const adjustedGasPrice = gasPrice.mul(120).div(100);

      const balance = await provider.getBalance(signerAddress);
      const gasCost = gasLimit.mul(adjustedGasPrice);
      if (balance.lt(gasCost)) {
        throw new Error("Solde insuffisant pour les frais de transaction");
      }

      const tx = await contract.releaseFunds(txnId, {
        gasLimit,
        gasPrice: adjustedGasPrice
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
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
          description: "Les fonds ont été libérés avec succès.",
        });
      } else {
        throw new Error("La libération des fonds a échoué");
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

  if (!isUserBuyer) return null;

  return (
    <Button
      onClick={handleConfirm}
      disabled={isLoading}
      className="w-full bg-purple-500 hover:bg-purple-600"
    >
      {isLoading ? "Libération des fonds en cours..." : "Confirmer la réception"}
    </Button>
  );
}
