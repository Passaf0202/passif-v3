import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ListingCard } from "../ListingCard";
import { Button } from "../ui/button";
import { 
  SlidersHorizontal, 
  MapPin, 
  Calendar, 
  Tag,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .ilike("title", `%${query}%`)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        setListings(data || []);
      }
      setIsLoading(false);
    };

    fetchListings();
  }, [query]);

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
      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Localisation
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Prix
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Année-Modèle
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
        </Button>
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
        <>
          <h2 className="text-xl font-semibold mb-4">
            {listings.length} résultat{listings.length > 1 ? 's' : ''} pour "{query}"
          </h2>
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
        </>
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