import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Sparkles } from "lucide-react";

export function RecommendedListingsSection() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecommendedListings = async () => {
      if (!user) {
        // Si l'utilisateur n'est pas connecté, afficher les dernières annonces
        const { data } = await supabase
          .from("listings")
          .select(`
            id,
            title,
            price,
            location,
            images,
            user_id,
            category
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(10);

        if (data) {
          setListings(data);
        }
        return;
      }

      // Si l'utilisateur est connecté, récupérer ses catégories préférées basées sur ses favoris
      const { data: favorites } = await supabase
        .from("favorites")
        .select("listings(category)")
        .eq("user_id", user.id);

      const preferredCategories = favorites
        ?.map(f => f.listings?.category)
        .filter((c): c is string => !!c);

      if (preferredCategories && preferredCategories.length > 0) {
        const { data } = await supabase
          .from("listings")
          .select(`
            id,
            title,
            price,
            location,
            images,
            user_id,
            category
          `)
          .eq("status", "active")
          .in("category", preferredCategories)
          .order("created_at", { ascending: false })
          .limit(10);

        if (data) {
          setListings(data);
        }
      }
    };

    fetchRecommendedListings();
  }, [user]);

  if (listings.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold text-gray-900">
            {user ? "Recommandé pour vous" : "Dernières annonces"}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {listings.map((listing) => (
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