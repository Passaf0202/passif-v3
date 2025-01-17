import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { FavoriteButton } from "./listing/FavoriteButton";
import { ShippingInfo } from "./listing/ShippingInfo";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { calculateBuyerProtectionFees } from "@/utils/priceUtils";
import { ListingImages } from "./listing/ListingImages";
import { PriceDetails } from "./listing/PriceDetails";

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
  
  const allImages = images?.length > 0 ? images : [image];
  const protectionFee = calculateBuyerProtectionFees(price);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group"
      onClick={() => navigate(`/listings/${id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <ListingImages 
            images={allImages} 
            title={title} 
            isHovered={isHovered} 
          />
          <FavoriteButton listingId={id} isHovered={isHovered} />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
        <PriceDetails price={price} protectionFee={protectionFee} />
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