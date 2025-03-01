
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MapPin, Shield, Clock, Tag, Star, Check } from "lucide-react";
import { useState } from "react";
import { FavoriteButton } from "./listing/FavoriteButton";
import { ShippingInfo } from "./listing/ShippingInfo";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { calculateBuyerProtectionFees } from "@/utils/priceUtils";
import { PriceDetails } from "./listing/PriceDetails";
import { useOptimizedImage } from "@/hooks/useOptimizedImage";
import { getCategoryIcon } from "@/utils/categoryIcons";
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
  category?: string;
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
  walletAddress,
  category
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
  const imageCount = allImages.length;

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.favorite-button')) {
      navigate(`/listings/${id}`);
    }
  };

  const truncateAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get the appropriate icon for this category
  const CategoryIcon = category ? getCategoryIcon(category) : null;

  // Calculate how recent the listing is
  const isRecent = created_at && 
    (new Date().getTime() - new Date(created_at).getTime()) < (24 * 60 * 60 * 1000);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer relative group w-[200px] border-gray-200 transform hover:scale-[1.02] duration-200"
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
          {/* Favorite button with improved styling */}
          <div className="absolute top-2 right-2 z-10 favorite-button">
            <FavoriteButton listingId={id} isHovered={isHovered} />
          </div>
          
          {/* Image count badge */}
          {imageCount > 1 && (
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <div className="flex -space-x-1">
                {[...Array(Math.min(imageCount, 3))].map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-white/80 border border-white/30" />
                ))}
              </div>
              <span>{imageCount} photos</span>
            </div>
          )}
          
          {/* Protection badge - made more visible */}
          {protectionFee > 0 && (
            <div className="absolute bottom-2 right-2 bg-primary text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <Shield className="w-3 h-3 text-white" />
              <span>Protégé</span>
            </div>
          )}
          
          {/* Category icon badge if available */}
          {category && CategoryIcon && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1.5">
              <CategoryIcon className="w-3.5 h-3.5" />
              <span className="capitalize">{category}</span>
            </div>
          )}
          
          {/* Recent listing badge */}
          {isRecent && (
            <div className="absolute top-10 left-0 bg-green-500 text-white px-2 py-1 text-xs flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>Nouveau</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
        <div className="protection-shield mt-1">
          <PriceDetails 
            price={price} 
            protectionFee={protectionFee}
            cryptoAmount={crypto_amount}
            cryptoCurrency={crypto_currency}
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <MapPin className="h-3 w-3 flex-shrink-0 text-gray-400" />
          <span className="line-clamp-1">{location}</span>
        </div>
        
        {/* Enhanced shipping method display */}
        <div className="mt-1">
          <ShippingInfo method={shipping_method} />
        </div>
        
        {created_at && (
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <Clock className="h-3 w-3 mr-1 text-gray-400" />
            <span>{formatDistanceToNow(new Date(created_at), { locale: fr, addSuffix: true })}</span>
          </p>
        )}
        
        {walletAddress && (
          <div className="flex items-center mt-1 bg-gray-50 rounded px-1.5 py-0.5">
            <Check className="h-3 w-3 text-green-500 mr-1" />
            <p className="text-xs text-gray-600">
              {truncateAddress(walletAddress)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
