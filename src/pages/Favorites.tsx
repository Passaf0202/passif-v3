
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SearchResults } from "@/components/search/SearchResults";

const Favorites = () => {
  const { user } = useAuth();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          listing_id,
          listings (
            id,
            title,
            description,
            price,
            location,
            images,
            user_id,
            shipping_method,
            crypto_amount,
            crypto_currency,
            category,
            subcategory,
            created_at,
            wallet_address
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching favorites:", error);
        throw error;
      }

      return data.map(f => f.listings);
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Mes Favoris</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favorites && favorites.length > 0 ? (
          <SearchResults listings={favorites} showFilters={false} />
        ) : (
          <p className="text-center text-gray-500 py-8">
            Vous n'avez pas encore d'annonces en favoris
          </p>
        )}
      </main>
    </div>
  );
};

export default Favorites;
