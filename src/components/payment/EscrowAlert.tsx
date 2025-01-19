import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface EscrowAlertProps {
  open: boolean;
  onClose: () => void;
}

export function EscrowAlert({ open, onClose }: EscrowAlertProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Paiement sécurisé via Escrow
          </SheetTitle>
          <SheetDescription className="space-y-4">
            <p>
              Le paiement sécurisé via Escrow fonctionne en plusieurs étapes :
            </p>
            <ol className="list-decimal pl-4 space-y-2">
              <li>
                Les fonds sont bloqués dans un contrat intelligent (smart contract)
              </li>
              <li>
                Le vendeur est notifié et expédie l'article
              </li>
              <li>
                À la réception, vous confirmez la réception et les fonds sont
                automatiquement libérés
              </li>
            </ol>
            <p className="text-sm text-muted-foreground mt-4">
              En cas de litige, notre équipe peut intervenir pour résoudre la
              situation.
            </p>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}