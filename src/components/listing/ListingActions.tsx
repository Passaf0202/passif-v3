import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ContactModal } from "@/components/ContactModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from 'wagmi';
import { supabase } from "@/integrations/supabase/client";

interface ListingActionsProps {
  listingId: string;
  sellerId: string;
  title: string;
  price: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onBuy: () => void;
}

export const ListingActions = ({ 
  listingId, 
  sellerId, 
  title, 
  price,
  cryptoAmount,
  cryptoCurrency,
  onBuy 
}: ListingActionsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [offerAmount, setOfferAmount] = useState("");
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCryptoPayment = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour acheter",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected || !address) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre portefeuille pour payer en crypto",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Creating crypto payment for listing:', listingId);

      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { 
          listingId,
          buyerAddress: address,
        }
      });

      if (error) throw error;

      console.log('Payment created:', data);

      if (data?.result?.url) {
        window.location.href = data.result.url;
      } else {
        throw new Error('Invalid payment URL received');
      }

    } catch (error) {
      console.error('Error processing crypto payment:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
        {cryptoAmount && cryptoCurrency ? (
          <Button 
            className="w-full" 
            onClick={handleCryptoPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              `Payer en ${cryptoCurrency}`
            )}
          </Button>
        ) : (
          <Button className="w-full" onClick={onBuy}>
            Acheter
          </Button>
        )}
        
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