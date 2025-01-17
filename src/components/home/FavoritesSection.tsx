import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Heart } from "lucide-react";

export function FavoritesSection() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: favoritesData, error } = await supabase
        .from("favorites")
        .select(`
          listing_id,
          listings (
            id,
            title,
            price,
            location,
            images,
            user_id
          )
        `)
        .eq("user_id", user.id)
        .limit(5);

      if (!error && favoritesData) {
        setFavorites(favoritesData.map(f => f.listings));
      }
      setIsLoading(false);
    };

    fetchFavorites();
  }, [user]);

  if (!user || favorites.length === 0 || isLoading) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold text-gray-900">Vos coups de cœur</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {favorites.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              price={listing.price}
              location={listing.location}
              image={listing.images?.[0] || "/placeholder.svg"}
              sellerId={listing.user_id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}