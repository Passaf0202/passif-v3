import { Link, useNavigate } from "react-router-dom";
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
import { useQuery } from "@tanstack/react-query";

export function Navbar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: categories } = useQuery({
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
    <div className="border-b">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <span className="text-2xl font-bold text-primary">Logo</span>
              </Link>
            </div>

            <Button 
              onClick={handleCreateListing}
              className="bg-primary hover:bg-primary/90 hidden md:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Déposer une annonce
            </Button>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
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
          <div className="flex overflow-x-auto py-3">
            <div className="flex justify-between w-full space-x-4">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.name.toLowerCase()}`}
                  className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleCreateListing}
        className="bg-primary hover:bg-primary/90 fixed bottom-4 right-4 md:hidden shadow-lg rounded-full"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}