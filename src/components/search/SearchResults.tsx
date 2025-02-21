
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SearchFilters } from "./types";
import { SearchFiltersHeader } from "./filters/SearchFiltersHeader";
import { ListingRow } from "./listings/ListingRow";
import { formatRelativeDate } from "@/utils/dateUtils";
import { Separator } from "../ui/separator";

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const titleOnly = searchParams.get("titleOnly") === "true";
  
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [totalCount, setTotalCount] = useState<number>(0);

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
          subcategory,
          subsubcategory,
          user:profiles!listings_user_id_fkey (
            id,
            full_name,
            avatar_url,
            wallet_address
          )
        `, { count: 'exact' })
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

      const { data, error, count } = await queryBuilder.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        console.log("Fetched listings:", data);
        setListings(data || []);
        setTotalCount(count || 0);
      }
      setIsLoading(false);
    };

    fetchListings();
  }, [query, titleOnly, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SearchFiltersHeader 
        filters={filters} 
        onFiltersChange={setFilters}
        totalCount={totalCount}
        location={filters.location}
      />

      <Separator className="my-6" />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              date={formatRelativeDate(listing.created_at)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">
            Aucune annonce trouvée
          </h2>
          <p className="text-gray-600">
            Modifiez vos critères de recherche pour trouver ce que vous cherchez
          </p>
        </div>
      )}
    </div>
  );
};
