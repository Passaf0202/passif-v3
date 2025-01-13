import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "./WalletConnectButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Heart, MessageCircle, Plus, LogOut } from "lucide-react";
import { useToast } from "./ui/use-toast";

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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">Logo</span>
            </Link>
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
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
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
    </nav>
  );
}