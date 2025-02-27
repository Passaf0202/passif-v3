import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Issue } from "lucide-react";
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

interface EscrowActionsProps {
  transactionId: string;
  blockchainTxnId?: string;
  sellerAddress?: string;
  isBuyer: boolean;
  isSeller: boolean;
  isCompleted: boolean;
  onRelease: () => void;
}

export function EscrowActions({
  transactionId,
  blockchainTxnId,
  sellerAddress,
  isBuyer,
  isSeller,
  isCompleted,
  onRelease,
}: EscrowActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const { releaseEscrow } = useReleaseEscrow();
  const isMobile = useIsMobile();

  const handleReleaseFunds = async () => {
    if (!blockchainTxnId) {
      toast({
        title: "Erreur",
        description: "ID de transaction blockchain manquant",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReleasing(true);
      await releaseEscrow(blockchainTxnId);
      
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
    }
  };

  if (isCompleted) {
    return null;
  }

  // L'interface pour appareils mobiles
  if (isMobile) {
    return (
      <div className="space-y-4">
        <MobileWalletRedirect
          isProcessing={isLoading || isReleasing}
          onConfirm={handleReleaseFunds}
          action="release"
        />
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Issue className="mr-2 h-4 w-4" />
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
  if (isBuyer) {
    return (
      <div className="space-y-4">
        <Button
          onClick={handleReleaseFunds}
          disabled={isReleasing || !blockchainTxnId}
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
          <Issue className="mr-2 h-4 w-4" />
          Signaler un problème
        </Button>
      </div>
    );
  }

  if (isSeller) {
    return (
      <div className="space-y-4">
        <Button disabled className="w-full">
          En attente de confirmation de l'acheteur
        </Button>
        
        <Button variant="outline" className="w-full">
          <Issue className="mr-2 h-4 w-4" />
          Contacter l'acheteur
        </Button>
      </div>
    );
  }

  return null;
}
