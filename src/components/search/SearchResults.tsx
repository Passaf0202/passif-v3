
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SearchFilters } from "./types";
import { MapPin, Euro, Package2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "../ui/card";
import { FavoriteButton } from "../listing/FavoriteButton";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  user_id: string;
  shipping_method: string;
  crypto_amount: number;
  crypto_currency: string;
  category: string;
  subcategory: string;
  created_at: string;
  wallet_address: string;
}

interface SearchResultsProps {
  listings: Listing[];
  showFilters?: boolean;
  actionButtons?: (listingId: string) => React.ReactNode;
  // Propriétés ajoutées pour corriger les erreurs de type
  totalCount?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export const SearchResults = ({ 
  listings, 
  showFilters = true, 
  actionButtons,
  totalCount = 0,
  currentPage = 1,
  itemsPerPage = 12,
  onPageChange
}: SearchResultsProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<SearchFilters>({});

  const truncateAddress = (address?: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleListingClick = (listingId: string, event: React.MouseEvent) => {
    // Vérifier si le clic s'est produit sur le bouton favori ou dans sa zone
    if ((event.target as HTMLElement).closest('.favorite-button')) {
      event.stopPropagation();
      return;
    }
    navigate(`/listings/${listingId}`);
  };

  const renderFilterButtons = () => (
    <div className={`flex gap-2 mb-6 ${isMobile ? 'overflow-x-auto pb-2' : ''}`}>
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "default"} 
        className="flex items-center gap-2 whitespace-nowrap"
        onClick={() => setFilters({ ...filters, location: filters.location ? undefined : "France" })}
      >
        <MapPin className="h-4 w-4" />
        Toute la France
      </Button>
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "default"} 
        className="flex items-center gap-2 whitespace-nowrap"
        onClick={() => setFilters({ 
          ...filters, 
          minPrice: filters.minPrice ? undefined : 0,
          maxPrice: filters.maxPrice ? undefined : 1000
        })}
      >
        <Euro className="h-4 w-4" />
        Prix
      </Button>
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "default"} 
        className="flex items-center gap-2 whitespace-nowrap"
        onClick={() => setFilters({ ...filters, shipping_method: filters.shipping_method ? undefined : "hand-delivery" })}
      >
        <Package2 className="h-4 w-4" />
        Mode de livraison
      </Button>
    </div>
  );

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-8 space-x-2">
        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index}
            variant={currentPage === index + 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange && onPageChange(index + 1)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    );
  };

  const ListingCardMobile = ({ listing }: { listing: Listing }) => (
    <Card 
      className="overflow-hidden mb-4 cursor-pointer"
      onClick={(e) => handleListingClick(listing.id, e)}
    >
      <div className="relative">
        <img
          src={listing.images?.[0] || "/placeholder.svg"}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 favorite-button">
          <FavoriteButton listingId={listing.id} isHovered={true} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{listing.title}</h3>
          <div className="text-right">
            <p className="text-xl font-bold">{listing.price},00 €</p>
            <p className="text-sm text-gray-500">≈ {listing.crypto_amount} {listing.crypto_currency}</p>
          </div>
        </div>
        <div className="flex items-center text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{listing.location}</span>
        </div>
        {listing.category && listing.subcategory && (
          <div className="flex gap-2 mb-2">
            <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
              {listing.category}
            </span>
            <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
              {listing.subcategory}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            {formatDistanceToNow(new Date(listing.created_at), { 
              locale: fr,
              addSuffix: true 
            })}
          </span>
          <span>Wallet: {truncateAddress(listing.wallet_address)}</span>
        </div>
        {actionButtons && (
          <div className="mt-4">
            {actionButtons(listing.id)}
          </div>
        )}
      </div>
    </Card>
  );

  const ListingCardDesktop = ({ listing }: { listing: Listing }) => (
    <Card 
      className="flex mb-4 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={(e) => handleListingClick(listing.id, e)}
    >
      <div className="relative w-72 h-48 flex-shrink-0">
        <img
          src={listing.images?.[0] || "/placeholder.svg"}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 favorite-button">
          <FavoriteButton listingId={listing.id} isHovered={true} />
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
            <div className="flex items-center text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{listing.location}</span>
            </div>
            {listing.category && listing.subcategory && (
              <div className="flex gap-2">
                <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
                  {listing.category}
                </span>
                <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
                  {listing.subcategory}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{listing.price},00 €</p>
            <p className="text-sm text-gray-500">≈ {listing.crypto_amount} {listing.crypto_currency}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <span>
            {formatDistanceToNow(new Date(listing.created_at), { 
              locale: fr,
              addSuffix: true 
            })}
          </span>
          <span>Wallet: {truncateAddress(listing.wallet_address)}</span>
        </div>
        {actionButtons && (
          <div className="mt-4">
            {actionButtons(listing.id)}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-6'} py-6`}>
      {showFilters && renderFilterButtons()}
      <div>
        {listings.map((listing) => (
          isMobile ? (
            <ListingCardMobile key={listing.id} listing={listing} />
          ) : (
            <ListingCardDesktop key={listing.id} listing={listing} />
          )
        ))}
      </div>
      {onPageChange && totalPages > 1 && renderPagination()}
    </div>
  );
};
