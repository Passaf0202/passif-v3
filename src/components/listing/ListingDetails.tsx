
import { Shield, Star, MapPin } from "lucide-react";
import { ListingImages } from "./ListingImages";
import { ListingHeader } from "./ListingHeader";
import { SellerInfo } from "./SellerInfo";
import { ListingActions } from "./ListingActions";
import { ProductDetailsCard } from "./ProductDetailsCard";
import { LocationMap } from "./LocationMap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useCryptoConversion } from "@/hooks/useCryptoConversion";
import { useQuery } from "@tanstack/react-query";
import { validateAndUpdateCryptoAmount } from "@/hooks/escrow/useCryptoAmount";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  if (!listing.user) {
    console.error("User information is missing from the listing");
    return (
      <div className="text-center p-4">
        <p>Information du vendeur non disponible</p>
      </div>
    );
  }

  const sellerWalletAddress = listingData?.wallet_address || listing.wallet_address;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ListingImages images={listing.images} title={listing.title} isHovered={false} />
          
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {listing.location}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationMap location={listing.location} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="sticky top-4">
            <Card>
              <CardContent className="p-6">
                <ListingHeader 
                  title={listing.title} 
                  price={listing.price} 
                  cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
                  cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
                />
                
                <Separator className="my-6" />
                
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-700">Protection Acheteurs</p>
                      <p className="text-sm text-blue-600">
                        Paiement sécurisé via notre plateforme avec escrow
                      </p>
                    </div>
                  </div>

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
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Profil Vendeur</span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm">5.0</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SellerInfo 
                  seller={listing.user} 
                  location={listing.location} 
                  walletAddress={sellerWalletAddress}
                />
              </CardContent>
            </Card>

            <ProductDetailsCard details={listing} className="mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
