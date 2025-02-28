
import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface FavoriteButtonProps {
  listingId: string;
  isHovered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function FavoriteButton({ 
  listingId, 
  isHovered = false,
  size = 'md',
  showLabel = false
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Tailles d'icônes pour différentes tailles de bouton
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  // Classes pour différentes tailles de bouton
  const buttonSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11'
  };

  // Vérifier si l'utilisateur a mis cette annonce en favori
  const { data: isFavorite = false, isLoading } = useQuery({
    queryKey: ['favorite', listingId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking favorite status", error);
      }
      
      return !!data;
    },
    enabled: !!user,
  });

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Connectez-vous pour ajouter des annonces à vos favoris",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isFavorite) {
        // Retirer des favoris
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);
          
        if (error) throw error;
        
        toast({
          title: "Retiré des favoris",
          description: "Cette annonce a été retirée de vos favoris"
        });
      } else {
        // Ajouter aux favoris
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            listing_id: listingId
          });
          
        if (error) throw error;
        
        toast({
          title: "Ajouté aux favoris",
          description: "Cette annonce a été ajoutée à vos favoris"
        });
      }
      
      // Invalider les requêtes liées aux favoris
      queryClient.invalidateQueries({ queryKey: ['favorite', listingId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    } catch (error) {
      console.error("Error toggling favorite", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier vos favoris. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Style du bouton de favoris
  const buttonClass = `favorite-button group transition-colors rounded-full flex items-center justify-center shadow-sm ${
    buttonSizes[size]
  } ${
    isFavorite 
      ? "bg-primary hover:bg-primary/90" 
      : isHovered
        ? "bg-white/90 hover:bg-white"
        : "bg-white/70 hover:bg-white/90"
  }`;

  return (
    <button
      className={buttonClass}
      onClick={toggleFavorite}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      disabled={isLoading}
    >
      <Heart
        className={`
          transition-colors
          ${isFavorite ? "fill-white stroke-white" : "fill-transparent stroke-gray-700"}
          ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}
        `}
      />
      {showLabel && (
        <span className={`ml-2 text-sm ${isFavorite ? "text-white" : "text-gray-700"}`}>
          {isFavorite ? "Favoris" : "Favoris"}
        </span>
      )}
    </button>
  );
}
