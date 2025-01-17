import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, X, MessageCircle, Lock } from "lucide-react";
import { Button } from "../ui/button";

interface BuyerProtectionModalProps {
  price: number;
  protectionFee: number;
}

export const BuyerProtectionModal = ({ price, protectionFee }: BuyerProtectionModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          <Shield className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">Détails du prix</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Article</span>
              <span>{price.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Frais de Protection acheteurs</span>
              <span>{protectionFee.toFixed(2)} €</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Les frais de port sont calculés lors de la commande.
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Protection acheteurs</h3>
              <p className="text-gray-600 mb-4">
                Découvre comment nous calculons les frais de Protection acheteurs
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Politique de remboursement</h4>
                    <p className="text-gray-600">
                      Tu peux obtenir un remboursement si ta commande :
                    </p>
                    <ul className="list-disc ml-5 text-gray-600">
                      <li>est perdue ou n'est jamais livrée</li>
                      <li>arrive endommagée</li>
                      <li>n'est pas du tout conforme à sa description</li>
                    </ul>
                    <p className="text-gray-600 mt-2">
                      Tu disposes de 2 jours pour soumettre une réclamation à compter du moment où la livraison de la commande t'est notifiée, même si l'article n'a jamais été livré.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Transactions sécurisées</h4>
                    <p className="text-gray-600">
                      Ton paiement est conservé en toute sécurité pendant toute la durée de la transaction. Les paiements sont cryptés par notre partenaire de paiement, ton argent est donc toujours envoyé ou reçu en toute sécurité. Le vendeur n'aura jamais accès à tes informations de paiement.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Une équipe dédiée</h4>
                    <p className="text-gray-600">
                      N'hésite pas à contacter notre équipe support à tout moment. Elle est là pour t'aider.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};