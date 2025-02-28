
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

// Limiter le nombre de listings à charger
const MAX_LISTINGS = 5;

export function RecommendedListingsSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Utilisation de React Query pour un caching efficace
  const { data: listings = [], isLoading } = useQuery({
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
            category,
            shipping_method,
            crypto_amount,
            crypto_currency,
            wallet_address,
            created_at
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
            category,
            shipping_method,
            crypto_amount,
            crypto_currency,
            wallet_address,
            created_at
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

  if (listings.length === 0 && !isLoading) return null;

  const viewMoreListings = () => {
    navigate('/search');
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-gray-900">
              {user ? "Recommandé pour vous" : "Dernières annonces"}
            </h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={viewMoreListings}
            className="hidden sm:flex"
          >
            Voir plus
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-[320px] bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
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
                crypto_amount={listing.crypto_amount}
                crypto_currency={listing.crypto_currency}
                walletAddress={listing.wallet_address}
                created_at={listing.created_at}
              />
            ))}
          </div>
        )}
        
        <div className="mt-6 flex justify-center sm:hidden">
          <Button onClick={viewMoreListings} className="w-full">
            Voir plus
          </Button>
        </div>
      </div>
    </section>
  );
}
