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
import { Dialog, DialogContent } from "./ui/dialog";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const allImages = images?.length > 0 ? images : [image];
  const protectionFee = calculateBuyerProtectionFees(price);

  const handleCardClick = (e: React.MouseEvent) => {
    // Si l'événement ne vient pas du bouclier ou de l'image, naviguer vers l'annonce
    if (!(e.target as HTMLElement).closest('.protection-shield')) {
      navigate(`/listings/${id}`);
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group w-[200px]"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-0">
          <div className="relative h-[200px]">
            <ListingImages 
              images={allImages} 
              title={title} 
              isHovered={isHovered}
              onImageClick={(e) => e.stopPropagation()}
            />
            <FavoriteButton listingId={id} isHovered={isHovered} />
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
          <div className="protection-shield">
            <PriceDetails price={price} protectionFee={protectionFee} />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
          {created_at && (
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(created_at), "d MMM yyyy", { locale: fr })}
            </p>
          )}
          <ShippingInfo method={shipping_method} />
        </CardContent>
      </Card>
    </>
  );
};