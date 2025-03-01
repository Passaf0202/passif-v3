
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Search, Plus, Heart, MessageCircle, Save, ChevronRight, ArrowLeft, Wallet, User, List, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { useState, useRef, useEffect } from "react";
import { CategoryContent } from "../components/CategoryContent";
import { NavbarLogo } from "../NavbarLogo";
import { SearchInput } from "@/components/search/SearchInput";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function MobileMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  const handleCreateListing = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour déposer une annonce",
      });
      // Sauvegarder l'URL de retour avant la redirection
      localStorage.setItem('redirectAfterAuth', '/create');
      navigate("/auth");
      return;
    }
    // Si l'utilisateur est connecté, naviguer directement vers la page de création
    navigate("/create");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Sauvegarder la recherche
      const searches = JSON.parse(localStorage.getItem("savedSearches") || "[]");
      const newSearch = {
        query: searchInput,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(
        "savedSearches",
        JSON.stringify([...searches, newSearch].slice(-10))
      );

      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
      setShowSearch(false);
    }
  };

  const handleSavedSearches = () => {
    const searches = JSON.parse(localStorage.getItem("savedSearches") || "[]");
    if (searches.length === 0) {
      toast({
        title: "Aucune recherche sauvegardée",
        description: "Vos recherches seront automatiquement sauvegardées quand vous en effectuerez.",
      });
      return;
    }
    navigate("/saved-searches");
  };

  const handleWalletConnection = () => {
    const walletButton = document.querySelector('[data-testid="web3modal-connect-button"]');
    if (walletButton instanceof HTMLElement) {
      walletButton.click();
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const renderMainContent = () => (
    <>
      {showSearch ? (
        <div className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              titleOnly={false}
              onTitleOnlyChange={() => {}}
              showCheckbox={false}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Rechercher
              </Button>
              <Button variant="outline" onClick={() => setShowSearch(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Top Block */}
          <div className="space-y-4 p-4 border-b border-gray-200">
            <Button 
              onClick={handleCreateListing}
              className="w-full bg-black hover:bg-black/90 text-white rounded-full h-12 flex items-center gap-3 text-base font-normal"
            >
              <Plus className="h-5 w-5" />
              Déposer une annonce
            </Button>

            {user ? (
              <div className="flex flex-col gap-3">
                <div className="w-full">
                  <WalletConnectButton className="w-full h-12 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-full" />
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/profile")}
                  className="w-full h-12 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-full"
                >
                  <User className="h-5 w-5" />
                  Mon Profil
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="w-full h-12 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-full"
              >
                <User className="h-5 w-5" />
                Se connecter
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => setShowSearch(true)}
              className="w-full justify-start h-12 px-0 hover:bg-transparent hover:text-primary text-base font-normal"
            >
              <Search className="h-5 w-5 mr-3" />
              Rechercher
            </Button>
          </div>

          {/* Actions Block */}
          <div className="py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="space-y-1">
              <Button
                variant="ghost"
                onClick={() => navigate("/messages")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-100 text-gray-900 text-base font-normal"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                Messages
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/favorites")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-100 text-gray-900 text-base font-normal"
              >
                <Heart className="h-5 w-5 mr-3" />
                Favoris
              </Button>

              <Button
                variant="ghost"
                onClick={handleSavedSearches}
                className="w-full justify-start h-12 px-4 hover:bg-gray-100 text-gray-900 text-base font-normal"
              >
                <Save className="h-5 w-5 mr-3" />
                Recherches sauvegardées
              </Button>

              {user && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/my-listings")}
                    className="w-full justify-start h-12 px-4 hover:bg-gray-100 text-gray-900 text-base font-normal"
                  >
                    <List className="h-5 w-5 mr-3" />
                    Mes annonces
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate("/transactions")}
                    className="w-full justify-start h-12 px-4 hover:bg-gray-100 text-gray-900 text-base font-normal"
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    Mes transactions
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start h-12 px-4 hover:bg-gray-100 text-gray-900 text-base font-normal"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Déconnexion
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Categories Block */}
          <div className="py-4">
            <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">Catégories</h3>
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 text-left"
              >
                <span className="text-base">{capitalizeFirstLetter(category.name)}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>

          {/* Bottom Block */}
          <div className="py-4 border-t border-gray-200">
            {!user && (
              <Link
                to="/auth"
                className="flex items-center justify-between px-4 py-3 font-medium text-primary hover:bg-gray-100"
              >
                Se connecter
                <ChevronRight className="h-5 w-5" />
              </Link>
            )}

            <div className="mt-4">
              <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">Informations pratiques</h3>
              <Link
                to="/help"
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-100"
              >
                <span className="text-base">Centre d'aide</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              <Link
                to="/about"
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-100"
              >
                <span className="text-base">À propos</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderCategoryContent = () => (
    <div className="h-full flex flex-col">
      <SheetHeader className="h-14 px-4 flex flex-row items-center justify-between border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setSelectedCategory(null)}
          className="absolute left-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex justify-center">
          <span className="text-lg font-medium">
            {capitalizeFirstLetter(selectedCategory?.name || "")}
          </span>
        </div>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        {selectedCategory && (
          <CategoryContent category={selectedCategory} />
        )}
      </div>
    </div>
  );

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full p-0 border-0">
          <div className="h-full flex flex-col">
            {selectedCategory ? (
              renderCategoryContent()
            ) : (
              <>
                <SheetHeader className="h-14 px-4 flex flex-row items-center justify-between border-b">
                  <div className="flex-1 flex justify-center">
                    <NavbarLogo />
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  {renderMainContent()}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
