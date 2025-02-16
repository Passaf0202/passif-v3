
import { Link, useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, Plus, Settings, LogOut, User, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "../WalletConnectButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLink } from "./AdminLink";
import { MenuWalletBalance } from "../wallet/MenuWalletBalance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export const NavbarActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{ username?: string, first_name?: string, full_name?: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, first_name, full_name')
          .eq('id', user.id)
          .single();
          
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, [user]);

  const displayName = userProfile?.username || userProfile?.first_name || userProfile?.full_name || '';

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
    <div className="flex items-center gap-2 md:gap-3">
      <Button 
        onClick={handleCreateListing}
        className="bg-primary/90 hover:bg-primary/80 hidden md:flex h-8 px-3 rounded-full text-sm transition-colors duration-200"
      >
        <Plus className="h-4 w-4 mr-1" />
        Déposer une annonce
      </Button>

      {user ? (
        <>
          <div className="flex-shrink-0">
            <WalletConnectButton />
          </div>
          <AdminLink />
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserRound className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </div>
                    {displayName && (
                      <span className="text-sm text-muted-foreground">
                        {displayName}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <MenuWalletBalance />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/messages" className="w-full cursor-pointer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="w-full cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Favoris
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="w-full cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            <WalletConnectButton />
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserRound className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end">
                <Link to="/auth" className="w-full">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Connexion
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
