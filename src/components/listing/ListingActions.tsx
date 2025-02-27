
import { useState } from 'react';
import { ContactModal } from "@/components/ContactModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from 'wagmi';
import { PaymentButton } from "../payment/PaymentButton";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface ListingActionsProps {
  listingId: string;
  sellerId: string;
  sellerAddress: string;
  title: string;
  price: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  isMobile?: boolean;
  isCheckoutPage?: boolean;
}

export const ListingActions = ({ 
  listingId, 
  sellerId,
  sellerAddress, 
  title, 
  price,
  cryptoAmount,
  cryptoCurrency,
  isMobile = false,
  isCheckoutPage = false
}: ListingActionsProps) => {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handlePaymentButtonClick = () => {
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

    // Si nous sommes sur la page de détail de l'annonce, rediriger vers la page de paiement
    if (!isCheckoutPage) {
      navigate(`/checkout`, { 
        state: { 
          listingId,
          sellerAddress,
          title,
          price,
          cryptoAmount,
          cryptoCurrency
        }
      });
    }
  };

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

    setIsProcessing(true);
    try {
      // Cette fonction ne sera appelée que depuis la page de checkout
      console.log("Initiation du paiement crypto pour l'annonce:", listingId);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
      {isCheckoutPage ? (
        <PaymentButton 
          isProcessing={isProcessing}
          isConnected={isConnected}
          cryptoAmount={cryptoAmount}
          cryptoCurrency={cryptoCurrency}
          onClick={handleCryptoPayment}
          sellerAddress={sellerAddress}
          listingId={listingId}
        />
      ) : (
        <Button 
          onClick={handlePaymentButtonClick} 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!isConnected}
        >
          Payer
        </Button>
      )}

      <Button 
        variant="outline" 
        className={isMobile ? 'w-full' : ''} 
        asChild
      >
        <ContactModal
          listingId={listingId}
          sellerId={sellerId}
          listingTitle={title}
        >
          Contacter le vendeur
        </ContactModal>
      </Button>
    </div>
  );
};
