
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

      // S'assurer qu'on est sur le bon réseau
      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
      }

      // Récupérer l'ID de transaction blockchain
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('blockchain_txn_id, smart_contract_address')
        .eq('id', transactionId)
        .single();

      if (txError || !transaction?.blockchain_txn_id || !transaction?.smart_contract_address) {
        throw new Error("Impossible de récupérer les détails de la transaction");
      }

      // Connecter au smart contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        transaction.smart_contract_address,
        ESCROW_ABI,
        signer
      );

      console.log('Confirming blockchain transaction:', transaction.blockchain_txn_id);
      const tx = await contract.confirmTransaction(transaction.blockchain_txn_id);
      console.log('Confirmation transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Confirmation receipt:', receipt);

      if (receipt.status === 1) {
        const { error } = await supabase.functions.invoke("release-escrow", {
          body: {
            transactionId,
            userId: currentUserId,
            action: "confirm",
          },
        });

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
      toast({
        title: "Erreur",
        description:
          error.message || "Une erreur est survenue lors de la confirmation",
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
