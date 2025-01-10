import { Button } from "@/components/ui/button";
import { PlusCircle, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            MonBonCoin
          </Link>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Se connecter</span>
              </Link>
            </Button>
            
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/create" className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                <span>Déposer une annonce</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};