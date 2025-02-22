import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Plus, Heart, MessageCircle, Bell, Settings, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

  const { data: userProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('username, first_name, full_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user
  });

  const displayName = userProfile?.username || userProfile?.first_name || userProfile?.full_name;

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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto">
          <Accordion type="single" collapsible className="w-full">
            {/* Section Déposer une annonce */}
            <div className="p-4 border-b">
              <Button 
                onClick={handleCreateListing}
                className="w-full bg-primary hover:bg-primary/90 rounded-full py-2 h-auto"
              >
                <Plus className="h-4 w-4 mr-2 stroke-[2.5]" />
                Déposer une annonce
              </Button>
            </div>

            {/* Section Mon compte */}
            {user ? (
              <AccordionItem value="account" className="border-b">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Mon compte
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 p-2">
                    <Link 
                      to="/profile" 
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Mon profil</span>
                      </div>
                      {displayName && (
                        <span className="text-sm text-muted-foreground">
                          {displayName}
                        </span>
                      )}
                    </Link>
                    <Link 
                      to="/messages" 
                      className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Link>
                    <Link 
                      to="/favorites" 
                      className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Favoris
                    </Link>
                    <Link 
                      to="/notifications" 
                      className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 hover:bg-gray-100 rounded-md text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : (
              <div className="p-4 border-b">
                <Link 
                  to="/auth"
                  className="flex items-center text-primary hover:underline"
                >
                  <User className="h-4 w-4 mr-2" />
                  Se connecter
                </Link>
              </div>
            )}

            {/* Section Catégories */}
            {categories?.map((category) => (
              <AccordionItem key={category.id} value={category.id} className="border-b">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                  {capitalizeFirstLetter(category.name)}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 p-2">
                    <Link
                      to={`/category/${category.name.toLowerCase()}`}
                      className="block px-4 py-2 text-primary hover:underline"
                    >
                      Voir tout {category.name.toLowerCase()}
                    </Link>
                    {category.subcategories?.map((subcategory) => (
                      <div key={subcategory.id} className="space-y-1">
                        <Link
                          to={`/category/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}`}
                          className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                        >
                          {capitalizeFirstLetter(subcategory.name)}
                        </Link>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            {/* Section Informations pratiques */}
            <AccordionItem value="info" className="border-b">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                Informations pratiques
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 p-2">
                  <Link 
                    to="/help" 
                    className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                  >
                    Centre d'aide
                  </Link>
                  <Link 
                    to="/contact" 
                    className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                  >
                    Nous contacter
                  </Link>
                  <Link 
                    to="/about" 
                    className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                  >
                    À propos
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
