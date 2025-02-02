import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_ABI = [
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)"
];

interface EscrowConfirmButtonProps {
  transactionId: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  getStoredTxnId: () => number | null;
  onConfirmation: () => void;
}

export function EscrowConfirmButton({
  transactionId,
  isLoading,
  setIsLoading,
  getStoredTxnId,
  onConfirmation
}: EscrowConfirmButtonProps) {
  const { toast } = useToast();
  const contractAddress = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

  const handleConfirmation = async () => {
    try {
      setIsLoading(true);

      // Récupérer le blockchain_txn_id depuis Supabase
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('blockchain_txn_id')
        .eq('id', transactionId)
        .single();

      if (fetchError || !transaction?.blockchain_txn_id) {
        throw new Error("ID de transaction blockchain non trouvé");
      }

      const txnId = transaction.blockchain_txn_id;
      console.log("Using blockchain transaction ID:", txnId);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, signer);

      console.log("Calling confirmTransaction with ID:", txnId);
      const tx = await contract.confirmTransaction(txnId);
      console.log("Confirmation transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Confirmation transaction receipt:", receipt);

      if (receipt.status === 1) {
        const { error } = await supabase.functions.invoke('release-escrow', {
          body: {
            transactionId,
            action: "confirm",
          },
        });

        if (error) throw error;

        toast({
          title: "Confirmation envoyée",
          description: "Votre confirmation a été enregistrée avec succès",
        });

        onConfirmation();
      }
    } catch (error) {
      console.error("Error confirming transaction:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de confirmer la transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConfirmation}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Confirmation en cours...
        </>
      ) : (
        "Confirmer la réception"
      )}
    </Button>
  );
}