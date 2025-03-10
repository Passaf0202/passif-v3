
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface FavoriteButtonProps {
  listingId: string;
  isHovered: boolean;
}

export const FavoriteButton = ({ listingId, isHovered }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: isFavorite, refetch: refetchFavorite } = useQuery({
    queryKey: ["favorite", listingId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking favorite:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user,
  });

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour ajouter des favoris",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("listing_id", listingId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Retiré des favoris",
          description: "L'annonce a été retirée de vos favoris",
        });
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert([{ listing_id: listingId, user_id: user.id }]);

        if (error) throw error;

        toast({
          title: "Ajouté aux favoris",
          description: "L'annonce a été ajoutée à vos favoris",
        });
      }
      
      refetchFavorite();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "bg-white/80 hover:bg-white rounded-md transition-opacity shadow-sm",
        !isHovered && !isFavorite && "opacity-0 group-hover:opacity-100",
        isLoading && "cursor-not-allowed opacity-70"
      )}
      onClick={handleFavoriteClick}
      disabled={isLoading}
    >
      <Heart 
        className={cn(
          "h-5 w-5",
          isFavorite ? "fill-black stroke-black" : "stroke-black"
        )} 
      />
    </Button>
  );
};
