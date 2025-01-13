import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "./WalletConnectButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Heart, MessageCircle, Plus, LogOut, Search, Menu } from "lucide-react";
import { useToast } from "./ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
  { name: "Mode", path: "/category/mode" },
  { name: "Maison & Jardin", path: "/category/maison" },
  { name: "Multimédia", path: "/category/multimedia" },
  { name: "Loisirs", path: "/category/loisirs" },
  { name: "Véhicules", path: "/category/vehicules" },
  { name: "Immobilier", path: "/category/immobilier" },
  { name: "Emploi", path: "/category/emploi" },
  { name: "Autres", path: "/category/autres" },
];

export function Navbar() {
  const { user } = useAuth();
  const { toast } = useToast();

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
    <div className="border-b">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <span className="text-2xl font-bold text-primary">Logo</span>
              </Link>
            </div>

            <div className="flex items-center flex-grow justify-center max-w-2xl px-4">
              <div className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher sur le site"
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/create">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Déposer une annonce
                    </Button>
                  </Link>
                  <Link to="/messages" className="text-gray-600 hover:text-gray-900">
                    <MessageCircle className="h-6 w-6" />
                  </Link>
                  <Link to="/favorites" className="text-gray-600 hover:text-gray-900">
                    <Heart className="h-6 w-6" />
                  </Link>
                  <Link to="/notifications" className="text-gray-600 hover:text-gray-900">
                    <Bell className="h-6 w-6" />
                  </Link>
                  <WalletConnectButton />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="w-full">
                          Mon profil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        Se déconnecter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost">Connexion</Button>
                  </Link>
                  <WalletConnectButton />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-3 space-x-8">
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}