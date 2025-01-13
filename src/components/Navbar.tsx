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
  { name: "Maison", path: "/category/maison" },
  { name: "Multimédia", path: "/category/multimedia" },
  { name: "Loisirs", path: "/category/loisirs" },
  { name: "Bricolage", path: "/category/bricolage" },
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

            <div className="hidden md:flex items-center space-x-8">
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/create">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Vendre
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
      
      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex md:hidden overflow-x-auto py-3 space-x-6">
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
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