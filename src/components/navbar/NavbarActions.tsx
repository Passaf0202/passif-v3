import { Link, useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "../WalletConnectButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const NavbarActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateListing = () => {
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
    <div className="flex items-center gap-4">
      <Button 
        onClick={handleCreateListing}
        className="bg-primary hover:bg-primary/90 hidden md:flex h-10"
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
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" className="h-10">
              Connexion
            </Button>
          </Link>
          <WalletConnectButton />
        </div>
      )}
    </div>
  );
};