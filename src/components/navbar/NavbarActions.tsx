
import { CircleUserRound, Bell, Heart, PlusSquare, LogOut, ShoppingBag, MessageSquare, Package, User, Settings, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuWalletBalance } from "../wallet/MenuWalletBalance";
import { AdminLink } from "./AdminLink";
import { useState, useEffect } from "react";

export function NavbarActions() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Récupération du nombre de messages non lus
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('count', { count: 'exact' })
          .eq('receiver_id', user.id)
          .eq('read', false);

        if (error) throw error;
        
        if (data) {
          setUnreadMessages(data.length);
        }
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };

    fetchUnreadMessages();
    
    // Abonnement aux nouveaux messages
    if (user) {
      const subscription = supabase
        .channel('new_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, () => {
          fetchUnreadMessages();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirection vers la page d'accueil après déconnexion
      navigate('/');
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <WalletConnectButton />
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate('/auth')}
          className="whitespace-nowrap"
        >
          Connexion
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={() => navigate('/favorites')}
        variant="ghost" 
        size="icon"
        className="text-gray-600"
      >
        <Heart className="h-5 w-5" />
      </Button>
      
      <Button 
        onClick={() => navigate('/messages')}
        variant="ghost" 
        size="icon"
        className="text-gray-600 relative"
      >
        <MessageSquare className="h-5 w-5" />
        {unreadMessages > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadMessages > 9 ? '9+' : unreadMessages}
          </span>
        )}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-600">
            <CircleUserRound className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <div className="p-3">
              <div className="font-medium text-sm">{profile?.full_name || "Utilisateur"}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              <MenuWalletBalance />
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/create')}>
              <PlusSquare className="h-4 w-4 mr-2" />
              Vendre un article
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/my-listings')}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Mes annonces
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/payment')}>
              <DollarSign className="h-4 w-4 mr-2" />
              Mes transactions
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <AdminLink />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
