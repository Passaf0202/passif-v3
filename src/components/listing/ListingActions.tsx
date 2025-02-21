
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/ContactModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from 'wagmi';

interface ListingActionsProps {
  listingId: string;
  sellerId: string;
  sellerAddress: string;
  title: string;
  price: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  handleBuyClick?: () => void;
}

export const ListingActions = ({ 
  listingId, 
  sellerId,
  sellerAddress, 
  title, 
  price,
  cryptoAmount,
  cryptoCurrency,
  handleBuyClick,
}: ListingActionsProps) => {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
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

    setIsProcessing(true);
    try {
      if (handleBuyClick) {
        await handleBuyClick();
      }
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button className="w-full" onClick={handleCryptoPayment}>
          {cryptoAmount?.toFixed(6)} {cryptoCurrency} sur Polygon Amoy
        </Button>

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
