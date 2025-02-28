
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MapPin, Shield } from "lucide-react";
import { useState } from "react";
import { FavoriteButton } from "./listing/FavoriteButton";
import { ShippingInfo } from "./listing/ShippingInfo";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { calculateBuyerProtectionFees } from "@/utils/priceUtils";
import { ListingImages } from "./listing/ListingImages";
import { PriceDetails } from "./listing/PriceDetails";
import { useOptimizedImage } from "@/hooks/useOptimizedImage";
import { Badge } from "./ui/badge";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  images?: string[];
  sellerId: string;
  shipping_method?: string;
  created_at?: string;
  crypto_amount?: number;
  crypto_currency?: string;
  walletAddress?: string | null;
}

export function ListingCard({
  id,
  title,
  price,
  location,
  image,
  images,
  sellerId,
  shipping_method,
  created_at,
  crypto_amount,
  crypto_currency,
  walletAddress
}: ListingCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  // Utiliser notre hook pour optimiser l'image principale
  const { optimizedUrl: optimizedImage } = useOptimizedImage(image, {
    width: 200,
    height: 200,
    quality: 75
  });
  
  const allImages = images?.length > 0 ? images : [image ? image : optimizedImage];
  const protectionFee = calculateBuyerProtectionFees(price);

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.favorite-button')) {
      navigate(`/listings/${id}`);
    }
  };

  const truncateAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Fonction pour tronquer le texte avec des points de suspension
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group w-[200px]"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0">
        <div className="relative h-[200px]">
          <img 
            src={optimizedImage} 
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="absolute top-2 right-2 favorite-button">
            <FavoriteButton listingId={id} isHovered={isHovered} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1" title={title}>{truncateText(title, 20)}</h3>
        <div className="protection-shield mt-2 flex items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold">{price.toFixed(2).replace('.', ',')} €</span>
              {protectionFee > 0 && (
                <div className="flex items-center text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  <Shield className="h-3 w-3 mr-0.5" />
                  <span>Protégé</span>
                </div>
              )}
            </div>
            {crypto_amount && crypto_currency && (
              <p className="text-xs text-gray-500">≈ {crypto_amount} {crypto_currency}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate" title={location}>{location}</span>
        </div>
        {created_at && (
          <p className="text-xs text-gray-500 mt-1">
            {format(new Date(created_at), "d MMM yyyy", { locale: fr })}
          </p>
        )}
        {walletAddress && (
          <p className="text-xs text-gray-500 mt-1">
            Wallet: {truncateAddress(walletAddress)}
          </p>
        )}
        <ShippingInfo method={shipping_method} />
      </CardContent>
    </Card>
  );
}
