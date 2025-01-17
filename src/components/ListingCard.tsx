import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { FavoriteButton } from "./listing/FavoriteButton";
import { ShippingInfo } from "./listing/ShippingInfo";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { calculateBuyerProtectionFees, formatPrice } from "@/utils/priceUtils";
import { BuyerProtectionModal } from "./listing/BuyerProtectionModal";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  images?: string[];
  sellerId: string;
  shipping_method?: string | null;
  created_at?: string;
}

export const ListingCard = ({ 
  id, 
  title, 
  price, 
  location, 
  image,
  images = [],
  shipping_method,
  created_at,
}: ListingCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const allImages = images?.length > 0 ? images : [image];
  const protectionFee = calculateBuyerProtectionFees(price);
  const totalPrice = price + protectionFee;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group"
      onClick={() => navigate(`/listings/${id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0">
        <div className="relative h-40">
          <img
            src={allImages[currentImageIndex]}
            alt={title}
            className="h-full w-full object-cover"
          />
          <FavoriteButton listingId={id} isHovered={isHovered} />
          
          {allImages.length > 1 && isHovered && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-sm text-gray-500 line-through">{formatPrice(price)} €</span>
          <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)} €</span>
          <BuyerProtectionModal price={price} protectionFee={protectionFee} />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>
        {created_at && (
          <p className="text-xs text-gray-500 mt-1">
            {format(new Date(created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        )}
        <ShippingInfo method={shipping_method} />
      </CardContent>
    </Card>
  );
};