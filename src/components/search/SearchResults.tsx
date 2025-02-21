
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SearchFilters } from "./types";
import { SearchFiltersButton } from "./filters/SearchFiltersButton";
import { MapPin, Euro, Truck } from "lucide-react";
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
  const [filters, setFilters] = useState<SearchFilters>({});

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
          category
        `)
        .eq("status", "active");

      if (titleOnly) {
        queryBuilder = queryBuilder.ilike("title", `%${query}%`);
      } else {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Apply filters
      if (filters.minPrice) {
        queryBuilder = queryBuilder.gte("price", filters.minPrice);
      }
      if (filters.maxPrice) {
        queryBuilder = queryBuilder.lte("price", filters.maxPrice);
      }
      if (filters.location) {
        queryBuilder = queryBuilder.ilike("location", `%${filters.location}%`);
      }
      if (filters.condition) {
        queryBuilder = queryBuilder.eq("condition", filters.condition);
      }
      if (filters.shipping_method) {
        queryBuilder = queryBuilder.eq("shipping_method", filters.shipping_method);
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
  }, [query, titleOnly, filters]);

  const truncateAddress = (address?: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{listings.length} annonces</h1>
      
      <div className="flex gap-4 mb-8">
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Toute la France
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Euro className="h-4 w-4" />
          Prix
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Mode de livraison
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card 
              key={listing.id}
              className="flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative"
              onClick={() => window.location.href = `/listings/${listing.id}`}
            >
              <div className="relative w-80 h-60">
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
                    <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                    <div className="flex items-center text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.location}</span>
                    </div>
                    {listing.category && (
                      <div className="flex gap-2 mt-2">
                        {listing.category.split(',').map((cat: string) => (
                          <span 
                            key={cat} 
                            className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                          >
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      {formatDistanceToNow(new Date(listing.created_at), { 
                        locale: fr,
                        addSuffix: true 
                      })}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold">{listing.price},00</p>
                    <p className="text-sm text-gray-500">
                      ≈ {listing.crypto_amount} {listing.crypto_currency}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Wallet: {truncateAddress(listing.wallet_address)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
