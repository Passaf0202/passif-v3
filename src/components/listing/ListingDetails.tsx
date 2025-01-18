import { Shield } from "lucide-react";
import { ListingImages } from "./ListingImages";
import { ListingHeader } from "./ListingHeader";
import { SellerInfo } from "./SellerInfo";
import { ListingActions } from "./ListingActions";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useCryptoRates } from "@/hooks/useCryptoRates";
import { useCurrencyStore } from "@/stores/currencyStore";

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
    };
    location: string;
    user_id: string;
    crypto_amount?: number;
    crypto_currency?: string;
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
  const { data: cryptoRates } = useCryptoRates();
  const { selectedCurrency } = useCurrencyStore();

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

  const calculateCryptoAmount = () => {
    if (!cryptoRates || !listing.crypto_currency) return null;
    
    const rate = cryptoRates.find(r => r.symbol === listing.crypto_currency);
    if (!rate) return null;

    let price = listing.price;
    switch (selectedCurrency) {
      case 'USD':
        price = price * rate.rate_usd;
        break;
      case 'GBP':
        price = price * rate.rate_gbp;
        break;
      default: // EUR
        price = price * rate.rate_eur;
        break;
    }
    
    return price;
  };

  const cryptoAmount = calculateCryptoAmount();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ListingImages images={listing.images} title={listing.title} isHovered={false} />

      <div className="space-y-6">
        <ListingHeader 
          title={listing.title} 
          price={listing.price} 
          cryptoAmount={cryptoAmount}
          cryptoCurrency={listing.crypto_currency}
        />
        
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
          cryptoAmount={cryptoAmount}
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
              {listing.mileage && (
                <div>
                  <p className="text-sm text-gray-500">Kilométrage</p>
                  <p>{listing.mileage.toLocaleString()} km</p>
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
              {listing.transmission && (
                <div>
                  <p className="text-sm text-gray-500">Transmission</p>
                  <p>{listing.transmission}</p>
                </div>
              )}
              {listing.fuel_type && (
                <div>
                  <p className="text-sm text-gray-500">Carburant</p>
                  <p>{listing.fuel_type}</p>
                </div>
              )}
              {listing.doors && (
                <div>
                  <p className="text-sm text-gray-500">Nombre de portes</p>
                  <p>{listing.doors}</p>
                </div>
              )}
              {listing.crit_air && (
                <div>
                  <p className="text-sm text-gray-500">Vignette Crit'Air</p>
                  <p>{listing.crit_air}</p>
                </div>
              )}
              {listing.emission_class && (
                <div>
                  <p className="text-sm text-gray-500">Classe d'émission</p>
                  <p>{listing.emission_class}</p>
                </div>
              )}
              {listing.shipping_method && (
                <div>
                  <p className="text-sm text-gray-500">Mode de livraison</p>
                  <p>{listing.shipping_method}</p>
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