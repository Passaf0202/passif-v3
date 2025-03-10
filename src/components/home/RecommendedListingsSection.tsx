
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Limiter le nombre de listings à charger
const MAX_LISTINGS = 5;

export function RecommendedListingsSection() {
  const { user } = useAuth();

  // Utilisation de React Query pour un caching efficace
  const { data: listings = [] } = useQuery({
    queryKey: ['recommended-listings', user?.id],
    queryFn: async () => {
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
          `) // Sélection minimale des champs
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(MAX_LISTINGS); // Limite explicite

        return data || [];
      }

      // Si l'utilisateur est connecté, récupérer ses catégories préférées
      const { data: favorites } = await supabase
        .from("favorites")
        .select("listings(category)")
        .eq("user_id", user.id)
        .limit(10); // Limite pour réduire la taille

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
          .limit(MAX_LISTINGS);

        return data || [];
      }

      return [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes de cache
    gcTime: 1000 * 60 * 60, // 1 heure de conservation (remplace cacheTime)
  });

  if (listings.length === 0) return null;

  return (
    <section className="py-12 bg-gray-100">
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
