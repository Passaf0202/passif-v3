import { Button } from "@/components/ui/button";
import { PlusCircle, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            MonBonCoin
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/create" className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    <span>Déposer une annonce</span>
                  </Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  <span>Se déconnecter</span>
                </Button>
              </>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Se connecter</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};