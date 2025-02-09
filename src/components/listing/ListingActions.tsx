
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/ContactModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from 'wagmi';
import { PaymentButton } from "../payment/PaymentButton";
import { useNavigate } from 'react-router-dom';

interface ListingActionsProps {
  listingId: string;
  sellerId: string;
  sellerAddress: string;
  title: string;
  price: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
}

export const ListingActions = ({ 
  listingId, 
  sellerId,
  sellerAddress, 
  title, 
  price,
  cryptoAmount,
  cryptoCurrency,
}: ListingActionsProps) => {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

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
      navigate(`/payment/${listingId}`);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <PaymentButton 
          isProcessing={isProcessing}
          isConnected={isConnected}
          cryptoAmount={cryptoAmount}
          cryptoCurrency={cryptoCurrency}
          onClick={handleCryptoPayment}
          sellerAddress={sellerAddress}
          mode="pay"
        />

        <Button variant="outline" className="w-full" asChild>
          <ContactModal
            listingId={listingId}
            sellerId={sellerId}
            listingTitle={title}
          />
        </Button>
      </div>
    </div>
  );
};
