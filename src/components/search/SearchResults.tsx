import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ListingCard } from "../ListingCard";
import { Button } from "../ui/button";
import { 
  MapPin, 
  Calendar,
  Filter,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "../ui/input";
import { SearchFilters } from "./types";
import { Card } from "../ui/card";
import { Label } from "../ui/label";

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const titleOnly = searchParams.get("titleOnly") === "true";
  
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      console.log("Fetching listings with query:", query, "titleOnly:", titleOnly);

      let queryBuilder = supabase
        .from("listings")
        .select("*")
        .eq("status", "active");

      // Apply title search
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
      if (filters.category) {
        queryBuilder = queryBuilder.eq("category", filters.category);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {listings.length} résultat{listings.length > 1 ? 's' : ''} pour "{query}"
          </h2>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Prix minimum</Label>
                <Input
                  type="number"
                  placeholder="Prix min"
                  value={filters.minPrice || ""}
                  onChange={(e) => setFilters(f => ({ ...f, minPrice: Number(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Prix maximum</Label>
                <Input
                  type="number"
                  placeholder="Prix max"
                  value={filters.maxPrice || ""}
                  onChange={(e) => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Localisation</Label>
                <Input
                  placeholder="Ville ou région"
                  value={filters.location || ""}
                  onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Input
                  placeholder="Catégorie"
                  value={filters.category || ""}
                  onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                />
              </div>
            </div>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Localisation
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </Button>
        </div>
      </div>

      {/* AI Search Assistant */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center gap-4">
        <Sparkles className="h-6 w-6 text-primary" />
        <div className="flex-1">
          <h3 className="font-medium">Recherche IA - pour vous aider à trouver</h3>
          <p className="text-sm text-gray-600">Posez une question ou décrivez ce que vous cherchez</p>
        </div>
        <Button variant="outline">
          Poser une question
        </Button>
      </div>

      {/* Results */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              price={listing.price}
              location={listing.location}
              image={listing.images?.[0] || "/placeholder.svg"}
              sellerId={listing.user_id}
              shipping_method={listing.shipping_method}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">
            Aucune annonce trouvée pour "{query}"
          </h2>
          <p className="text-gray-600 mb-6">
            Soyez le premier à créer une annonce pour cette recherche !
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = "/create"}
          >
            Créer une annonce
          </Button>
        </div>
      )}
    </div>
  );
};