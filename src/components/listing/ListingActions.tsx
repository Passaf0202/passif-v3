import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ContactModal } from "@/components/ContactModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ListingActionsProps {
  listingId: string;
  sellerId: string;
  title: string;
  price: number;
  onBuy: () => void;
}

export const ListingActions = ({ listingId, sellerId, title, price, onBuy }: ListingActionsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [offerAmount, setOfferAmount] = useState("");
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const handleMakeOffer = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour faire une offre",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    if (amount >= price) {
      toast({
        title: "Erreur",
        description: "L'offre doit être inférieure au prix demandé",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here we would typically send the offer to the backend
      toast({
        title: "Succès",
        description: "Votre offre a été envoyée au vendeur",
      });
      setIsOfferModalOpen(false);
      setOfferAmount("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de l'offre",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button className="w-full" onClick={onBuy}>
          Acheter
        </Button>
        
        <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Faire une offre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Faire une offre</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Prix actuel : {price} €
              </p>
              <Input
                type="number"
                placeholder="Votre offre en €"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
              />
              <Button className="w-full" onClick={handleMakeOffer}>
                Envoyer l'offre
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" className="w-full" asChild>
          <ContactModal
            listingId={listingId}
            sellerId={sellerId}
            listingTitle={title}
          />
        </Button>
        <Button variant="ghost" size="icon">
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};