
import { Link, useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "../WalletConnectButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import { AdminLink } from "./AdminLink";

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
    <div className="flex items-center gap-4">
      <Button 
        onClick={handleCreateListing}
        className="bg-primary/90 hover:bg-primary/80 hidden md:flex h-8 px-4 rounded-full text-sm transition-colors duration-200"
      >
        <Plus className="h-4 w-4 mr-1" />
        Déposer
      </Button>

      {user ? (
        <>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link to="/messages">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link to="/favorites">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <AdminLink />
          </div>
          <div className="flex-shrink-0">
            <WalletConnectButton />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button 
              variant="ghost" 
              className="h-8 px-4 rounded-full text-sm hover:bg-gray-100 transition-colors duration-200"
            >
              Connexion
            </Button>
          </Link>
          <WalletConnectButton />
        </div>
      )}
    </div>
  );
}
