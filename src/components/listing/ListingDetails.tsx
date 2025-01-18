import { Shield } from "lucide-react";
import { ListingImages } from "./ListingImages";
import { ListingHeader } from "./ListingHeader";
import { SellerInfo } from "./SellerInfo";
import { ListingActions } from "./ListingActions";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface ListingDetailsProps {
  listing: {
    id: string;
    title: string;
    price: number;
    description: string;
    images: string[];
    location: string;
    user_id: string;
    brand?: string;
    condition?: string;
    color?: string[];
    material?: string[];
    crypto_currency?: string;
    crypto_amount?: number;
    model?: string;
    year?: number;
    shipping_method?: string;
    shipping_weight?: number;
    user: {
      avatar_url: string | null;
      full_name: string;
      wallet_address: string | null;
    };
  };
}

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        listing,
        returnUrl: `/listings/${listing.id}`
      } 
    });
  };

  const truncateAddress = (address?: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ListingImages images={listing.images} title={listing.title} isHovered={false} />

      <div className="space-y-6">
        <ListingHeader title={listing.title} price={listing.price} />
        
        <SellerInfo 
          seller={listing.user} 
          location={listing.location} 
          walletAddress={listing.user.wallet_address}
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
          title={listing.title}
          price={listing.price}
          cryptoAmount={listing.crypto_amount}
          cryptoCurrency={listing.crypto_currency}
          handleBuyClick={handleBuyClick}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Détails du produit</h2>
            <div className="grid grid-cols-2 gap-4">
              {listing.brand && (
                <div>
                  <p className="text-sm text-gray-500">Marque</p>
                  <p>{listing.brand}</p>
                </div>
              )}
              {listing.condition && (
                <div>
                  <p className="text-sm text-gray-500">État</p>
                  <p>{listing.condition}</p>
                </div>
              )}
              {listing.color && listing.color.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Couleur</p>
                  <p>{listing.color.join(", ")}</p>
                </div>
              )}
              {listing.material && listing.material.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Matière</p>
                  <p>{listing.material.join(", ")}</p>
                </div>
              )}
              {listing.model && (
                <div>
                  <p className="text-sm text-gray-500">Modèle</p>
                  <p>{listing.model}</p>
                </div>
              )}
              {listing.year && (
                <div>
                  <p className="text-sm text-gray-500">Année</p>
                  <p>{listing.year}</p>
                </div>
              )}
              {listing.shipping_method && (
                <div>
                  <p className="text-sm text-gray-500">Mode de livraison</p>
                  <p>{listing.shipping_method}</p>
                </div>
              )}
              {listing.shipping_weight && (
                <div>
                  <p className="text-sm text-gray-500">Poids</p>
                  <p>{listing.shipping_weight} kg</p>
                </div>
              )}
              {listing.crypto_currency && (
                <div>
                  <p className="text-sm text-gray-500">Crypto-monnaie acceptée</p>
                  <p>{listing.crypto_currency}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};