
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Search, Plus, Heart, MessageCircle, Bell, Save, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";

export function MobileMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  const handleCreateListing = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour déposer une annonce",
      });
      navigate("/auth");
      return;
    }
    navigate("/create");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full p-0 border-0">
        <div className="h-full flex flex-col">
          {/* Header avec logo et bouton fermer */}
          <SheetHeader className="h-14 px-4 flex flex-row items-center justify-between border-b">
            <div className="flex-1 flex justify-center">
              <Link to="/" className="text-2xl font-bold">
                Tradecoiner
              </Link>
            </div>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute right-4">
                <X className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </SheetHeader>

          {/* Corps du menu */}
          <div className="flex-1 overflow-y-auto">
            {/* Actions principales */}
            <div className="space-y-6 p-4">
              <Button 
                onClick={handleCreateListing}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-md h-12 flex items-center gap-3 text-base font-normal"
              >
                <Plus className="h-5 w-5" />
                Déposer une annonce
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/search")}
                className="w-full justify-start h-12 px-0 hover:bg-transparent hover:text-primary text-base font-normal"
              >
                <Search className="h-5 w-5 mr-3" />
                Rechercher
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/messages")}
                className="w-full justify-start h-12 px-0 hover:bg-transparent hover:text-primary text-base font-normal"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                Messages
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/favorites")}
                className="w-full justify-start h-12 px-0 hover:bg-transparent hover:text-primary text-base font-normal"
              >
                <Heart className="h-5 w-5 mr-3" />
                Favoris
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/saved-searches")}
                className="w-full justify-start h-12 px-0 hover:bg-transparent hover:text-primary text-base font-normal"
              >
                <Save className="h-5 w-5 mr-3" />
                Recherches sauvegardées
              </Button>
            </div>

            {/* Séparateur */}
            <div className="h-2 bg-gray-100" />

            {/* Liste des catégories */}
            <div className="py-4">
              <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">Catégories</h3>
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.name.toLowerCase()}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <span className="text-base">{capitalizeFirstLetter(category.name)}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>

            {/* Séparateur */}
            <div className="h-2 bg-gray-100" />

            {/* Connexion et liens pratiques */}
            <div className="py-4">
              {!user && (
                <Link
                  to="/auth"
                  className="flex items-center justify-between px-4 py-3 font-medium text-primary hover:bg-gray-50"
                >
                  Se connecter
                  <ChevronRight className="h-5 w-5" />
                </Link>
              )}

              <div className="mt-4">
                <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">Informations pratiques</h3>
                <Link
                  to="/help"
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <span className="text-base">Centre d'aide</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  to="/about"
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <span className="text-base">À propos</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
