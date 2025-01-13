import { Link, useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "../WalletConnectButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";

export const NavbarActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    <div className="flex items-center justify-end gap-4 flex-1 md:flex-none">
      <Button 
        onClick={handleCreateListing}
        className="bg-primary hover:bg-primary/90 hidden md:flex h-10 whitespace-nowrap"
      >
        <Plus className="h-4 w-4 mr-2" />
        Déposer une annonce
      </Button>

      {user ? (
        <>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/messages" className="text-gray-600 hover:text-gray-900">
              <MessageCircle className="h-6 w-6" />
            </Link>
            <Link to="/favorites" className="text-gray-600 hover:text-gray-900">
              <Heart className="h-6 w-6" />
            </Link>
            <Link to="/notifications" className="text-gray-600 hover:text-gray-900">
              <Bell className="h-6 w-6" />
            </Link>
          </div>
          <WalletConnectButton />
        </>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" className="h-10 whitespace-nowrap">
              Connexion
            </Button>
          </Link>
          <WalletConnectButton />
        </div>
      )}
    </div>
  );
}