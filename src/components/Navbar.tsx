import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Heart, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: unreadCount } = useQuery({
    queryKey: ["unreadMessages", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("Error fetching unread messages:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      console.log("Attempting to log out...");
      
      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session check error:", sessionError);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification de la session",
          variant: "destructive",
        });
        return;
      }

      if (!session) {
        console.log("No active session found, clearing local state...");
        // If no session exists, just clear the local state
        await supabase.auth.signOut({ scope: 'local' });
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès",
        });
        return;
      }

      // If we have a valid session, proceed with global logout
      console.log("Active session found, proceeding with global logout...");
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la déconnexion",
          variant: "destructive",
        });
        return;
      }

      console.log("Logout successful");
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue",
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
              <Link to="/messages" className="relative">
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-5 w-5" />
                  {unreadCount ? (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {unreadCount}
                    </Badge>
                  ) : null}
                </Button>
              </Link>
              <Link to="/favorites">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
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