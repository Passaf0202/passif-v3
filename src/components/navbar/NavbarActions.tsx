
import { Button } from "@/components/ui/button";
import { PlusIcon, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ProfileMenu } from "@/components/navbar/ProfileMenu";
import { Separator } from "@/components/ui/separator";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function NavbarActions() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isCreateRoute = location.pathname === "/create";

  if (isMobile) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 ml-auto">
      {isAuthenticated ? (
        <>
          <div className="flex items-center space-x-4">
            <WalletConnectButton minimal />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/create">
                  <Button 
                    variant={isCreateRoute ? "secondary" : "outline"} 
                    size="sm" 
                    className={`h-8 rounded-full px-3 ${isCreateRoute ? 'text-white' : 'text-[#555555]'}`}
                  >
                    <PlusIcon className="mr-1 h-4 w-4" />
                    <span className="whitespace-nowrap">Déposer une annonce</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Créer une nouvelle annonce</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />
          
          {/* Actions utilisateur */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="px-2" size="icon" asChild>
              <Link to="/favorites">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
            
            <ProfileMenu />
          </div>
        </>
      ) : (
        <>
          <Link to="/auth">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-full px-3 border border-zinc-200 text-[#555555]"
            >
              Connexion
            </Button>
          </Link>
          
          <Link to="/auth?tab=register">
            <Button 
              size="sm" 
              className="h-8 rounded-full px-3 bg-[#000000] hover:bg-[#000000]/90"
            >
              Inscription
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
