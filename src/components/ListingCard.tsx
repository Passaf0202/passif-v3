import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Truck, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  sellerId: string;
  shipping_method?: string | null;
}

export const ListingCard = ({ 
  id, 
  title, 
  price, 
  location, 
  image,
  shipping_method 
}: ListingCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  // Vérifier si l'annonce est en favori
  const { data: isFavorite, refetch: refetchFavorite } = useQuery({
    queryKey: ["favorite", id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("listing_id", id)
        .eq("user_id", user.id)
        .single();

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

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("listing_id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Retiré des favoris",
          description: "L'annonce a été retirée de vos favoris",
        });
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert([{ listing_id: id, user_id: user.id }]);

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
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group"
      onClick={() => navigate(`/listings/${id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={image}
            alt={title}
            className="h-48 w-full object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 bg-white/80 hover:bg-white transition-opacity",
              !isHovered && !isFavorite && "opacity-0 group-hover:opacity-100"
            )}
            onClick={handleFavoriteClick}
          >
            <Heart 
              className={cn(
                "h-5 w-5",
                isFavorite ? "fill-red-500 stroke-red-500" : "stroke-gray-600"
              )} 
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-2xl font-bold text-primary">{price} €</p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex gap-2 mt-2">
          {shipping_method === 'both' && (
            <>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="h-4 w-4" />
                <span>En main propre</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Truck className="h-4 w-4" />
                <span>Livraison</span>
              </div>
            </>
          )}
          {shipping_method === 'pickup' && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User className="h-4 w-4" />
              <span>En main propre</span>
            </div>
          )}
          {shipping_method === 'delivery' && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Truck className="h-4 w-4" />
              <span>Livraison</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};