
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { formatPrice } from "@/utils/priceUtils";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCryptoConversion } from "@/hooks/useCryptoConversion";

interface ListingRowProps {
  listing: {
    id: string;
    title: string;
    price: number;
    location: string;
    images: string[];
    category?: string;
    subcategory?: string;
    subsubcategory?: string;
    crypto_amount?: number;
    crypto_currency?: string;
    wallet_address?: string;
    user?: {
      full_name: string;
      wallet_address?: string;
    };
  };
  date: string;
}

export function ListingRow({ listing, date }: ListingRowProps) {
  const isMobile = useIsMobile();
  const cryptoDetails = useCryptoConversion(listing.price);
  
  const categories = [
    listing.category,
    listing.subcategory,
    listing.subsubcategory
  ].filter(Boolean);

  return (
    <Link to={`/listings/${listing.id}`} className="block w-full">
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex gap-4 p-4">
          <div className="w-24 h-24 sm:w-48 sm:h-48 relative flex-shrink-0">
            <img
              src={listing.images[0] || "/placeholder.svg"}
              alt={listing.title}
              className="w-full h-full object-cover rounded-md"
            />
            <div className="absolute top-2 right-2">
              <FavoriteButton listingId={listing.id} isHovered={true} />
            </div>
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-base sm:text-lg font-semibold line-clamp-2">{listing.title}</h3>
              <div className="text-right flex-shrink-0">
                <p className="font-bold whitespace-nowrap">
                  {formatPrice(listing.price)}
                </p>
                {cryptoDetails && (
                  <p className="text-xs text-gray-600 whitespace-nowrap">
                    ≈ {cryptoDetails.amount.toFixed(8)} {cryptoDetails.currency}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="mt-2 flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {date}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
