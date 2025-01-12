import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ListingCard } from "@/components/ListingCard";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

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
            price,
            location,
            images,
            user_id,
            shipping_method
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((listing) => (
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
          <p className="text-center text-gray-500">
            Vous n'avez pas encore d'annonces en favoris
          </p>
        )}
      </main>
    </div>
  );
};

export default Favorites;