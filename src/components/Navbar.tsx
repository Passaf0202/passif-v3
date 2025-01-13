import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "./WalletConnectButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Heart, MessageCircle, Plus, LogOut, Search, Menu } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { SearchBar } from "./SearchBar";
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
      console.log("Fetching categories...");
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .order("name");
      
      if (error) throw error;
      console.log("Fetched categories:", data);
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

  const onSearch = (query: string) => {
    console.log("Searching for:", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="border-b shadow-sm">
      {/* Top Navigation Bar */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">Logo</span>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <SearchBar onSearch={onSearch} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleCreateListing}
                className="bg-primary hover:bg-primary/90 hidden md:flex"
              >
                <Plus className="h-4 w-4 mr-2" />
                Déposer une annonce
              </Button>

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

      {/* Search Bar - Mobile Only */}
      <div className="md:hidden px-4 py-2">
        <SearchBar onSearch={onSearch} />
      </div>
      
      {/* Categories Navigation */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-3 scrollbar-hide">
            <div className="flex justify-between min-w-full gap-8">
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

      {/* Mobile Create Listing Button */}
      <Button 
        onClick={handleCreateListing}
        className="bg-primary hover:bg-primary/90 fixed bottom-4 right-4 md:hidden shadow-lg rounded-full z-50"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}