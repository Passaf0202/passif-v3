
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ESCROW_ABI = [
  "function createTransaction(address seller) payable returns (uint256)",
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
];

export interface EscrowConfirmButtonProps {
  transactionId?: string;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  getStoredTxnId?: () => Promise<string | null>;
  onConfirmation?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
}

export function EscrowConfirmButton({
  transactionId,
  isLoading,
  setIsLoading,
  getStoredTxnId,
  onConfirmation,
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description
}: EscrowConfirmButtonProps) {
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  // For Dialog confirmation usage
  if (isOpen !== undefined && onOpenChange && onConfirm) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title || "Confirmation"}</DialogTitle>
            <DialogDescription>
              {description || "Êtes-vous sûr de vouloir effectuer cette action ?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Original blockchain confirmation usage
  const handleConfirm = async () => {
    if (!transactionId || !setIsLoading || !getStoredTxnId || !onConfirmation) {
      console.error("Missing required props for blockchain confirmation");
      return;
    }
    
    try {
      setIsLoading(true);

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const contractAddress = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, signer);

      const storedTxnId = await getStoredTxnId();
      if (!storedTxnId) {
        throw new Error("ID de transaction blockchain non trouvé");
      }

      console.log('Confirming transaction:', storedTxnId);
      const tx = await contract.confirmTransaction(storedTxnId);
      console.log('Confirmation sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Confirmation receipt:', receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            buyer_confirmation: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateError) {
          throw updateError;
        }

        toast({
          title: "Confirmation réussie",
          description: "Votre confirmation a été enregistrée",
        });
        
        onConfirmation();
      } else {
        throw new Error("La confirmation a échoué");
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la confirmation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If we're using the button version (not dialog)
  return (
    <Button
      onClick={handleConfirm}
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
