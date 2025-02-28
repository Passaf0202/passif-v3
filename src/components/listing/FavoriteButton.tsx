
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface FavoriteButtonProps {
  listingId: string;
  isHovered: boolean;
}

export const FavoriteButton = ({ listingId, isHovered }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  // Récupération de l'état favori
  const { data: isFavorite } = useQuery({
    queryKey: ["favorite", listingId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking favorite:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user,
  });

  // Nouvelle implémentation du gestionnaire de clic
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    // Empêcher la propagation et la navigation
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour ajouter des favoris",
        variant: "destructive",
      });
      return;
    }

    // Éviter les clics multiples
    if (isToggling) return;
    
    setIsToggling(true);
    
    try {
      if (isFavorite) {
        // Supprimer des favoris
        await supabase
          .from("favorites")
          .delete()
          .eq("listing_id", listingId)
          .eq("user_id", user.id);

        toast({
          title: "Retiré des favoris",
          description: "L'annonce a été retirée de vos favoris",
        });
      } else {
        // Ajouter aux favoris
        await supabase
          .from("favorites")
          .insert([{ listing_id: listingId, user_id: user.id }]);

        toast({
          title: "Ajouté aux favoris",
          description: "L'annonce a été ajoutée à vos favoris",
        });
      }
      
      // Invalider les requêtes de favoris pour forcer le rafraîchissement
      await queryClient.invalidateQueries({
        queryKey: ["favorite"],
      });
      
      console.log("Favori modifié avec succès:", !isFavorite);
      
    } catch (error) {
      console.error("Erreur lors de la modification du favori:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification des favoris",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Nouveau rendu avec un style amélioré
  return (
    <button
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-300",
        isToggling && "opacity-50 cursor-wait"
      )}
      onClick={handleFavoriteClick}
      disabled={isToggling}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart 
        className={cn(
          "h-5 w-5 transition-colors",
          isFavorite ? "fill-red-500 stroke-red-500" : "stroke-gray-600"
        )} 
      />
    </button>
  );
};
