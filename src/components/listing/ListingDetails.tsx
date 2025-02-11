
import { Shield } from "lucide-react";
import { ListingImages } from "./ListingImages";
import { ListingHeader } from "./ListingHeader";
import { SellerInfo } from "./SellerInfo";
import { ListingActions } from "./ListingActions";
import { ProductDetailsCard } from "./ProductDetailsCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useCryptoConversion } from "@/hooks/useCryptoConversion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTransactionCreation } from "@/hooks/useTransactionCreation";

interface ListingDetailsProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    user: {
      id: string;
      wallet_address?: string | null;
      avatar_url: string;
      full_name: string;
    } | null;
    location: string;
    user_id: string;
    crypto_amount?: number;
    crypto_currency?: string;
    wallet_address?: string;
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    condition?: string;
    color?: string[];
    transmission?: string;
    fuel_type?: string;
    doors?: number;
    crit_air?: string;
    emission_class?: string;
    shipping_method?: string;
  };
}

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createTransaction } = useTransactionCreation();
  
  const cryptoDetails = useCryptoConversion(listing.price, listing.crypto_currency);

  // Fetch the listing's original wallet address
  const { data: listingData } = useQuery({
    queryKey: ['listing-wallet', listing.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('wallet_address')
        .eq('id', listing.id)
        .single();

      if (error) {
        console.error('Error fetching listing wallet:', error);
        throw error;
      }

      console.log('Fetched listing wallet:', data);
      return data;
    },
  });

  const handleBuyClick = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour acheter",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Création de la transaction dans la base de données d'abord
      const transaction = await createTransaction(
        listing.id,
        cryptoDetails?.amount || 0,
        cryptoDetails?.currency || 'MATIC',
        listingData?.wallet_address || listing.wallet_address || ''
      );

      console.log("Transaction created:", transaction);

      // Redirection vers la page de paiement avec l'ID de la transaction
      navigate(`/payment/${transaction.id}`);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la transaction",
        variant: "destructive",
      });
    }
  };

  if (!listing.user) {
    console.error("User information is missing from the listing");
    return (
      <div className="text-center p-4">
        <p>Information du vendeur non disponible</p>
      </div>
    );
  }

  // Use the listing's stored wallet_address instead of the user's current wallet
  const sellerWalletAddress = listingData?.wallet_address || listing.wallet_address;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ListingImages images={listing.images} title={listing.title} isHovered={false} />

      <div className="space-y-6">
        <ListingHeader 
          title={listing.title} 
          price={listing.price} 
          cryptoAmount={cryptoDetails?.amount}
          cryptoCurrency={cryptoDetails?.currency}
        />
        
        <SellerInfo 
          seller={listing.user} 
          location={listing.location} 
          walletAddress={sellerWalletAddress}
        />

        <div className="p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-700">Protection Acheteurs</p>
            <p className="text-sm text-blue-600">
              Paiement sécurisé via notre plateforme
            </p>
          </div>
        </div>

        <ListingActions
          listingId={listing.id}
          sellerId={listing.user_id}
          sellerAddress={sellerWalletAddress || ''}
          title={listing.title}
          price={listing.price}
          cryptoAmount={cryptoDetails?.amount}
          cryptoCurrency={cryptoDetails?.currency}
          handleBuyClick={handleBuyClick}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
        </div>

        <ProductDetailsCard details={listing} />
      </div>
    </div>
  );
};
