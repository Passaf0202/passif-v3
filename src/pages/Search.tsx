
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchInput } from "@/components/search/SearchInput";
import { Loader2 } from "lucide-react";

// Interface pour les filtres
interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

// Nombre d'annonces par page
const ITEMS_PER_PAGE = 12;

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [titleOnly, setTitleOnly] = useState(false);

  // Réinitialiser la page quand la requête change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters]);

  // Optimisation: fonction qui sélectionne uniquement les champs nécessaires
  const fetchListings = async () => {
    let supabaseQuery = supabase
      .from("listings")
      .select(`
        id,
        title,
        price,
        location,
        images,
        user_id,
        shipping_method,
        crypto_amount,
        crypto_currency,
        category,
        subcategory,
        created_at
      `, { count: 'exact' }) // Spécifier count: 'exact' pour obtenir le nombre total
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Appliquer la recherche textuelle
    if (query) {
      if (titleOnly) {
        supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
      } else {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%, description.ilike.%${query}%`);
      }
    }

    // Appliquer les filtres
    if (filters.category) {
      supabaseQuery = supabaseQuery.eq("category", filters.category);
    }
    if (filters.minPrice) {
      supabaseQuery = supabaseQuery.gte("price", filters.minPrice);
    }
    if (filters.maxPrice) {
      supabaseQuery = supabaseQuery.lte("price", filters.maxPrice);
    }
    if (filters.location) {
      supabaseQuery = supabaseQuery.ilike("location", `%${filters.location}%`);
    }

    // Pagination pour réduire la taille des données
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    supabaseQuery = supabaseQuery.range(from, to);

    const { data, error, count } = await supabaseQuery;

    if (error) throw error;
    
    return { 
      listings: data || [], 
      totalCount: count || 0 
    };
  };

  // Mise en cache avec React Query
  const { data, isLoading } = useQuery({
    queryKey: ["search", query, filters, titleOnly, currentPage],
    queryFn: fetchListings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("q", value);
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchInput
            value={query}
            onChange={handleSearchChange}
            titleOnly={titleOnly}
            onTitleOnlyChange={setTitleOnly}
            showCheckbox={true}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <SearchResults 
              listings={data?.listings || []}
              showFilters={true}
              totalCount={data?.totalCount}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
