
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export function FavoritesSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];

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
            user_id,
            shipping_method,
            crypto_amount,
            crypto_currency,
            wallet_address,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .limit(5);

      if (!error && favoritesData) {
        return favoritesData.map(f => f.listings).filter(Boolean);
      }
      return [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const viewAllFavorites = () => {
    navigate('/favorites');
  };

  if (!user || favorites.length === 0 || isLoading) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <h2 className="text-2xl font-semibold text-gray-900">Vos coups de cœur</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={viewAllFavorites}
            className="hidden sm:flex"
          >
            Voir tous
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
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
              crypto_amount={listing.crypto_amount}
              crypto_currency={listing.crypto_currency}
              walletAddress={listing.wallet_address}
              created_at={listing.created_at}
            />
          ))}
        </div>
        
        <div className="mt-6 flex justify-center sm:hidden">
          <Button onClick={viewAllFavorites} className="w-full">
            Voir tous mes favoris
          </Button>
        </div>
      </div>
    </section>
  );
}
