
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ListingCard } from "../ListingCard";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SearchFilters } from "./types";
import { SearchFiltersButton } from "./filters/SearchFiltersButton";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
          wallet_address
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

  const removeFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className={`space-y-6 ${isMobile ? 'px-2' : ''}`}>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h2 className="text-xl font-semibold">
            {listings.length} résultat{listings.length !== 1 ? 's' : ''} pour "{query}"
          </h2>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => (
                value && (
                  <Badge 
                    key={key} 
                    variant="secondary" 
                    className="px-3 py-1 text-sm"
                  >
                    <span className="mr-2">
                      {`${key === 'minPrice' ? 'Min: ' : key === 'maxPrice' ? 'Max: ' : ''}${value}`}
                    </span>
                    <X 
                      className="h-3 w-3 cursor-pointer inline-block hover:text-destructive" 
                      onClick={() => removeFilter(key as keyof SearchFilters)}
                    />
                  </Badge>
                )
              ))}
            </div>
            <SearchFiltersButton filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : listings.length > 0 ? (
          <div className={`grid gap-4 ${
            isMobile 
              ? 'grid-cols-2' 
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          }`}>
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                location={listing.location}
                image={listing.images?.[0] || "/placeholder.svg"}
                images={listing.images}
                sellerId={listing.user_id}
                shipping_method={listing.shipping_method}
                created_at={listing.created_at}
                crypto_amount={listing.crypto_amount}
                crypto_currency={listing.crypto_currency}
                walletAddress={listing.wallet_address}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-2xl font-semibold">
              Aucune annonce trouvée pour "{query}"
            </h2>
            <p className="text-gray-600">
              Soyez le premier à créer une annonce pour cette recherche !
            </p>
            <Button 
              size="lg"
              className="mt-4"
              onClick={() => window.location.href = "/create"}
            >
              Créer une annonce
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
