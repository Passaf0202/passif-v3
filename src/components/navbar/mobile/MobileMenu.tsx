
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, CircleUserRound, Heart, LogOut, PlusSquare, ShoppingBag, MessageSquare, Package, User, Settings, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { MenuWalletBalance } from "@/components/wallet/MenuWalletBalance";

export function MobileMenu() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Navigation items
  const actionItems = [
    {
      name: "Mon profil",
      icon: <User className="h-5 w-5" />,
      onClick: () => navigate('/profile')
    },
    {
      name: "Vendre un article",
      icon: <PlusSquare className="h-5 w-5" />,
      onClick: () => navigate('/create')
    },
    {
      name: "Mes favoris",
      icon: <Heart className="h-5 w-5" />,
      onClick: () => navigate('/favorites')
    },
    {
      name: "Mes annonces",
      icon: <ShoppingBag className="h-5 w-5" />,
      onClick: () => navigate('/my-listings')
    },
    {
      name: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      onClick: () => navigate('/messages')
    },
    {
      name: "Mes transactions",
      icon: <DollarSign className="h-5 w-5" />,
      onClick: () => navigate('/payment')
    }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-600">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%]">
        {user ? (
          <div className="flex flex-col h-full">
            <div className="py-6">
              <div className="flex items-center gap-3">
                <CircleUserRound className="h-8 w-8 text-gray-400" />
                <div>
                  <div className="font-medium">{profile?.full_name || "Utilisateur"}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</div>
                </div>
              </div>
              <div className="mt-4">
                <MenuWalletBalance />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex-1 overflow-auto py-2">
              <div className="space-y-1">
                {actionItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={item.onClick}
                  >
                    {item.icon}
                    {item.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="py-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-center items-center gap-4">
            <Button
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Connexion / Inscription
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
