
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { formatPrice } from "@/utils/priceUtils";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
  const categories = [
    listing.category,
    listing.subcategory,
    listing.subsubcategory
  ].filter(Boolean);

  const truncateAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Link to={`/listings/${listing.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow relative group">
        <div className="flex gap-4">
          <div className="w-48 h-48 relative flex-shrink-0">
            <img
              src={listing.images[0] || "/placeholder.svg"}
              alt={listing.title}
              className="w-full h-full object-cover rounded-md"
            />
            <div className="absolute top-2 right-2">
              <FavoriteButton listingId={listing.id} isHovered={true} />
            </div>
          </div>

          <div className="flex-grow space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold line-clamp-2">{listing.title}</h3>
              <div className="text-right">
                <p className="text-xl font-bold">{formatPrice(listing.price)}</p>
                {listing.crypto_amount && listing.crypto_currency && (
                  <p className="text-sm text-gray-600">
                    ≈ {listing.crypto_amount.toFixed(8)} {listing.crypto_currency}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {listing.location}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge key={index} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="flex justify-between items-end">
              <div className="text-sm text-gray-500">
                {date}
              </div>
              <div className="text-sm text-gray-600">
                Wallet: {truncateAddress(listing.wallet_address || listing.user?.wallet_address)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
