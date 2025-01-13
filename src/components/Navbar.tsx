import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "./WalletConnectButton";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Logo</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <WalletConnectButton />
            {user ? (
              <>
                <Link to="/create">
                  <Button>Créer une annonce</Button>
                </Link>
                <Link to="/messages">
                  <Button variant="outline">Messages</Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="outline">Favoris</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline">Profil</Button>
                </Link>
              </>
            ) : (
              <Link to="/auth">
                <Button>Connexion</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}