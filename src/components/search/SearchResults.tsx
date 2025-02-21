
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SearchFilters } from "./types";
import { MapPin, Euro, Package2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "../ui/card";
import { FavoriteButton } from "../listing/FavoriteButton";

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const titleOnly = searchParams.get("titleOnly") === "true";
  const isMobile = useIsMobile();
  
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      console.log("Fetching listings with query:", query, "titleOnly:", titleOnly);

      let queryBuilder = supabase
        .from("listings")
        .select(`
          id,
          title,
          price,
          location,
          images,
          user_id,
          created_at,
          shipping_method,
          crypto_amount,
          crypto_currency,
          wallet_address,
          category,
          subcategory
        `)
        .eq("status", "active");

      if (titleOnly) {
        queryBuilder = queryBuilder.ilike("title", `%${query}%`);
      } else {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        console.log("Fetched listings:", data);
        setListings(data || []);
      }
      setIsLoading(false);
    };

    fetchListings();
  }, [query, titleOnly]);

  const truncateAddress = (address?: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderFilterButtons = () => (
    <div className={`flex gap-2 mb-6 ${isMobile ? 'overflow-x-auto pb-2' : ''}`}>
      <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2 whitespace-nowrap">
        <MapPin className="h-4 w-4" />
        Toute la France
      </Button>
      <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2 whitespace-nowrap">
        <Euro className="h-4 w-4" />
        Prix
      </Button>
      <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2 whitespace-nowrap">
        <Package2 className="h-4 w-4" />
        Mode de livraison
      </Button>
    </div>
  );

  const ListingCardMobile = ({ listing }: { listing: any }) => (
    <Card className="overflow-hidden mb-4">
      <div className="relative">
        <img
          src={listing.images?.[0] || "/placeholder.svg"}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
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
      </div>
    </Card>
  );

  const ListingCardDesktop = ({ listing }: { listing: any }) => (
    <Card className="flex mb-4 hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
      <div className="relative w-72 h-48 flex-shrink-0">
        <img
          src={listing.images?.[0] || "/placeholder.svg"}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
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
      </div>
    </Card>
  );

  return (
    <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-6'} py-6`}>
      <h1 className="text-2xl font-bold mb-6">{listings.length} annonces</h1>
      {renderFilterButtons()}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div>
          {listings.map((listing) => (
            isMobile ? (
              <ListingCardMobile key={listing.id} listing={listing} />
            ) : (
              <ListingCardDesktop key={listing.id} listing={listing} />
            )
          ))}
        </div>
      )}
    </div>
  );
};
