import { Link, useNavigate } from "react-router-dom";
import { Bell, Heart, LogOut, MessageCircle, Plus } from "lucide-react";
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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
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
        navigate("/auth");
      }
    } catch (error) {
      console.error("Erreur inattendue lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 flex-1 md:flex-none w-full md:w-auto">
      <Button 
        onClick={handleCreateListing}
        className="bg-primary hover:bg-primary/90 hidden md:flex h-10 whitespace-nowrap"
      >
        <Plus className="h-4 w-4 mr-2" />
        Déposer une annonce
      </Button>

      {user ? (
        <>
          <div className="hidden md:flex items-center gap-2">
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
          <div className="flex-shrink-0">
            <WalletConnectButton />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="ml-2"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-2 flex-shrink-0">
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
};