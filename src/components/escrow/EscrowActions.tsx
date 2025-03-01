
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useReleaseFunds } from "./hooks/useBlockchainTransaction";
import { EscrowConfirmButton } from "./EscrowConfirmButton";
import { Transaction } from "./types/escrow";

interface EscrowActionsProps {
  transaction: Transaction;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onRelease: () => void;
  transactionId: string;
  onActionStart?: () => void;
}

export function EscrowActions({ 
  transaction, 
  isLoading, 
  setIsLoading, 
  onRelease,
  transactionId,
  onActionStart
}: EscrowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const { releaseFunds, isReleasing } = useReleaseFunds({
    transactionId,
    onSuccess: () => {
      setIsLoading(false);
      onRelease();
      setConfirmOpen(false);
    },
    onError: () => {
      setIsLoading(false);
      setConfirmOpen(false);
    }
  });

  const handleReleaseFunds = async () => {
    if (onActionStart) {
      onActionStart();
    }
    setIsLoading(true);
    await releaseFunds();
  };

  return (
    <>
      <div className="product-received-button">
        <Button
          className="w-full relative"
          disabled={isLoading || isReleasing}
          onClick={() => setConfirmOpen(true)}
        >
          {isLoading || isReleasing ? (
            <div className="flex items-center justify-center w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="loading-button-text">Traitement en cours...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <span className="product-received-icon text-green-500 mr-1">✓</span>
              <span>Produit reçu</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          )}
        </Button>
      </div>

      <EscrowConfirmButton
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleReleaseFunds}
        title="Confirmer la réception"
        description="En confirmant cette action, vous déclarez avoir reçu le produit en bon état et l'argent sera libéré au vendeur. Cette action est irréversible."
      />
    </>
  );
}
