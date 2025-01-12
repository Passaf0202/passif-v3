import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { FavoriteButton } from "./listing/FavoriteButton";
import { ShippingInfo } from "./listing/ShippingInfo";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  sellerId: string;
  shipping_method?: string | null;
}

export const ListingCard = ({ 
  id, 
  title, 
  price, 
  location, 
  image,
  shipping_method 
}: ListingCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group"
      onClick={() => navigate(`/listings/${id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={image}
            alt={title}
            className="h-48 w-full object-cover"
          />
          <FavoriteButton listingId={id} isHovered={isHovered} />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-2xl font-bold text-primary">{price} €</p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <ShippingInfo method={shipping_method} />
      </CardContent>
    </Card>
  );
};