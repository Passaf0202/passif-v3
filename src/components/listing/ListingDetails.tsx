
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
import { validateAndUpdateCryptoAmount } from "@/hooks/escrow/useCryptoAmount";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "../ui/card";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("../LocationPicker"), {
  ssr: false,
  loading: () => <p>Chargement de la carte...</p>,
});

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
    category?: string;
    subcategory?: string;
  };
}

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const cryptoDetails = useCryptoConversion(listing.price, listing.crypto_currency);

  const { data: listingData } = useQuery({
    queryKey: ['listing-wallet', listing.id],
    queryFn: async () => {
      try {
        const validatedListing = await validateAndUpdateCryptoAmount(listing);
        console.log('Listing with validated crypto amount:', validatedListing);
        return validatedListing;
      } catch (error: any) {
        console.error('Error validating crypto amount:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de calculer le montant en crypto",
          variant: "destructive",
        });
        return listing;
      }
    },
  });

  const handleBuyClick = () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour acheter",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/payment/${listing.id}`, { 
      state: { 
        listing: {
          ...listing,
          crypto_amount: listingData?.crypto_amount || cryptoDetails?.amount,
          crypto_currency: listingData?.crypto_currency || cryptoDetails?.currency,
          wallet_address: listingData?.wallet_address || listing.wallet_address
        },
        returnUrl: `/listings/${listing.id}`
      } 
    });
  };

  const categories = [listing.category, listing.subcategory].filter(Boolean);

  const renderSecurityInfo = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Protection Tradecoiner</h2>
      <div className="space-y-6">
        <div className="flex gap-4">
          <Shield className="h-6 w-6 text-blue-500" />
          <div>
            <p className="font-semibold mb-1">Paiement sécurisé</p>
            <p className="text-gray-600">Votre argent est sécurisé et versé au bon moment</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Shield className="h-6 w-6 text-blue-500" />
          <div>
            <p className="font-semibold mb-1">Support dédié</p>
            <p className="text-gray-600">Notre service client dédié vous accompagne</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHandDeliveryInfo = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Remise en main propre sécurisée</h2>
      <div className="space-y-6">
        <div className="flex gap-4">
          <Shield className="h-6 w-6 text-blue-500" />
          <div>
            <p className="font-semibold mb-1">Réservation garantie</p>
            <p className="text-gray-600">Réservez ce bien jusqu'au rendez-vous avec le vendeur</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Shield className="h-6 w-6 text-blue-500" />
          <div>
            <p className="font-semibold mb-1">Liberté de choix</p>
            <p className="text-gray-600">Restez libre de refuser ce bien s'il ne correspond pas à vos attentes</p>
          </div>
        </div>
      </div>
    </div>
  );

  const sellerWalletAddress = listingData?.wallet_address || listing.wallet_address;

  const MobileLayout = () => (
    <div className="space-y-6">
      <ListingImages images={listing.images} title={listing.title} />
      
      <div className="px-4">
        <ListingHeader 
          title={listing.title}
          price={listing.price}
          cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
          cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
          categories={categories}
          isMobile={true}
        />

        <div className="py-4">
          <ListingActions
            listingId={listing.id}
            sellerId={listing.user_id}
            sellerAddress={sellerWalletAddress}
            title={listing.title}
            price={listing.price}
            cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
            cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
            handleBuyClick={handleBuyClick}
            isMobile={true}
          />
        </div>

        <ProductDetailsCard details={listing} />
        
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Localisation</h2>
          <p className="text-gray-700 mb-4">{listing.location}</p>
          <div className="h-[300px] rounded-lg overflow-hidden">
            <DynamicMap onLocationChange={() => {}} />
          </div>
        </div>

        {renderSecurityInfo()}
        {renderHandDeliveryInfo()}

        <div className="mt-6">
          <SellerInfo 
            seller={listing.user}
            location={listing.location}
            walletAddress={sellerWalletAddress}
          />
        </div>
      </div>
    </div>
  );

  const DesktopLayout = () => (
    <div className="grid grid-cols-[2fr,1fr] gap-8 px-6 py-8">
      <div className="space-y-8">
        <ListingImages images={listing.images} title={listing.title} />
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Localisation</h2>
          <p className="text-gray-700 mb-4">{listing.location}</p>
          <div className="h-[400px] rounded-lg overflow-hidden">
            <DynamicMap onLocationChange={() => {}} />
          </div>
        </Card>

        <Card className="p-6">
          {renderSecurityInfo()}
        </Card>

        <Card className="p-6">
          {renderHandDeliveryInfo()}
        </Card>
      </div>

      <div className="space-y-6">
        <div className="sticky top-6">
          <Card className="p-6">
            <ListingHeader 
              title={listing.title}
              price={listing.price}
              cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
              cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
              categories={categories}
            />

            <div className="py-4">
              <ListingActions
                listingId={listing.id}
                sellerId={listing.user_id}
                sellerAddress={sellerWalletAddress}
                title={listing.title}
                price={listing.price}
                cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
                cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
                handleBuyClick={handleBuyClick}
              />
            </div>

            <ProductDetailsCard details={listing} />

            <div className="mt-6 pt-6 border-t">
              <SellerInfo 
                seller={listing.user}
                location={listing.location}
                walletAddress={sellerWalletAddress}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};
