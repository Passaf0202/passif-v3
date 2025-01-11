import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare } from "lucide-react";

export function Navbar() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link to="/" className="text-xl font-bold">
          Petites Annonces
        </Link>

        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/messages">
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/create">
                <Button>Créer une annonce</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Connexion</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}