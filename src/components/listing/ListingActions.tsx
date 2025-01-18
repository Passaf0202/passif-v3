import { useState } from "react";
import { Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  handleBuyClick?: () => void;
}

export const ListingActions = ({ 
  listingId, 
  sellerId, 
  title, 
  price,
  cryptoAmount,
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

    if (handleBuyClick) {
      handleBuyClick();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
            `Payer en ETH`
          )}
        </Button>

        <Button variant="outline" className="w-full" asChild>
          <ContactModal
            listingId={listingId}
            sellerId={sellerId}
            listingTitle={title}
          />
        </Button>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="icon">
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};