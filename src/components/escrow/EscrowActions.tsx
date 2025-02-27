
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { useReleaseEscrow } from "@/hooks/useReleaseEscrow";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileWalletRedirect } from "@/components/payment/MobileWalletRedirect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Transaction } from "./types/escrow";
import { Dispatch, SetStateAction } from "react";

interface EscrowActionsProps {
  transactionId: string;
  transaction?: Transaction;
  blockchainTxnId?: string;
  sellerAddress?: string;
  isBuyer?: boolean;
  isSeller?: boolean;
  isCompleted?: boolean;
  isLoading?: boolean;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
  onRelease: () => void;
  onActionStart?: () => void;
}

export function EscrowActions({
  transactionId,
  transaction,
  blockchainTxnId,
  sellerAddress,
  isBuyer,
  isSeller,
  isCompleted,
  isLoading: externalIsLoading,
  setIsLoading: setExternalIsLoading,
  onRelease,
  onActionStart,
}: EscrowActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const { releaseEscrow } = useReleaseEscrow();
  const isMobile = useIsMobile();

  // Utilisez l'ID de transaction blockchain de props ou de l'objet transaction
  const txnBlockchainId = blockchainTxnId || transaction?.blockchain_txn_id;
  
  // Détermine si l'utilisateur est acheteur/vendeur via props ou basé sur les IDs
  // Évite d'utiliser les propriétés 'is_buyer' ou 'is_seller' qui n'existent pas
  const userIsBuyer = isBuyer !== undefined ? isBuyer : 
                      (transaction?.buyer?.id === transaction?.buyer_id);
  
  const userIsSeller = isSeller !== undefined ? isSeller :
                       (transaction?.seller?.id === transaction?.seller_id);
  
  // Détermine si la transaction est complétée
  const txnIsCompleted = isCompleted !== undefined ? isCompleted :
                        (transaction?.escrow_status === 'completed');

  const handleReleaseFunds = async () => {
    if (!txnBlockchainId) {
      toast({
        title: "Erreur",
        description: "ID de transaction blockchain manquant",
        variant: "destructive",
      });
      return;
    }

    try {
      if (onActionStart) {
        onActionStart();
      }
      
      // Mettre à jour l'état de chargement local et externe si disponible
      setIsReleasing(true);
      if (setExternalIsLoading) {
        setExternalIsLoading(true);
      }
      
      await releaseEscrow(txnBlockchainId);
      
      toast({
        title: "Succès",
        description: "Les fonds ont été libérés au vendeur",
      });
      
      onRelease();
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de libérer les fonds",
        variant: "destructive",
      });
    } finally {
      setIsReleasing(false);
      if (setExternalIsLoading) {
        setExternalIsLoading(false);
      }
    }
  };

  if (txnIsCompleted) {
    return null;
  }

  // L'interface pour appareils mobiles
  if (isMobile) {
    return (
      <div className="space-y-4">
        <MobileWalletRedirect
          isProcessing={isLoading || isReleasing || (externalIsLoading || false)}
          onConfirm={handleReleaseFunds}
          action="release"
        />
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Signaler un problème
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Signaler un problème</DialogTitle>
              <DialogDescription>
                Si vous avez rencontré un problème avec cette commande, veuillez nous en informer afin que nous puissions vous aider.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <div className="space-y-1">
                <Label htmlFor="issue-type">Type de problème</Label>
                <Select>
                  <SelectTrigger id="issue-type">
                    <SelectValue placeholder="Sélectionnez un type de problème" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-received">Produit non reçu</SelectItem>
                    <SelectItem value="damaged">Produit endommagé</SelectItem>
                    <SelectItem value="not-as-described">Ne correspond pas à la description</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Décrivez le problème en détail..." />
              </div>
              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button>Envoyer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Interface pour ordinateur
  if (userIsBuyer) {
    return (
      <div className="space-y-4">
        <Button
          onClick={handleReleaseFunds}
          disabled={isReleasing || !txnBlockchainId}
          className="w-full"
        >
          {isReleasing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Libération des fonds en cours...
            </>
          ) : (
            "Confirmer la réception et libérer les fonds"
          )}
        </Button>
        
        <Button variant="outline" className="w-full">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Signaler un problème
        </Button>
      </div>
    );
  }

  if (userIsSeller) {
    return (
      <div className="space-y-4">
        <Button disabled className="w-full">
          En attente de confirmation de l'acheteur
        </Button>
        
        <Button variant="outline" className="w-full">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Contacter l'acheteur
        </Button>
      </div>
    );
  }

  return null;
}
