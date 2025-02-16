
import { SearchBar } from "./SearchBar";
import { NavbarLogo } from "./navbar/NavbarLogo";
import { NavbarActions } from "./navbar/NavbarActions";
import { MobileCreateButton } from "./navbar/MobileCreateButton";
import { useNavigate } from "react-router-dom";
import { NavbarCategories } from "./navbar/NavbarCategories";
import { useCategoriesData } from "./navbar/categories/useCategoriesData";
import { useRef } from "react";
import { useAdaptiveLayout } from "@/hooks/use-adaptive-layout";
import { MobileMenu } from "./navbar/mobile/MobileMenu";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { data: categories } = useCategoriesData();
  
  const isMobile = useAdaptiveLayout(containerRef, categoriesRef);

  const onSearch = (query: string) => {
    console.log("Searching for:", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto" ref={containerRef}>
        {/* Top section */}
        <div className="h-12 border-b border-gray-200/80">
          <div className="h-full flex items-center px-4">
            <div className="w-full flex items-center justify-between">
              {/* Menu à gauche */}
              <div className="flex-shrink-0">
                <MobileMenu />
              </div>

              {/* Logo au centre */}
              <div className="flex-1 flex justify-center">
                <div className="w-auto flex-shrink-0 scale-90">
                  <NavbarLogo />
                </div>
              </div>

              {/* Wallet à droite */}
              <div className="flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full flex items-center justify-center h-8 w-8"
                >
                  <Wallet className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories section */}
        <div ref={categoriesRef}>
          <NavbarCategories categories={categories || []} isMobile={isMobile} />
        </div>

        {/* Mobile search */}
        {isMobile && (
          <div className="px-4 py-2 bg-white border-b border-gray-200/80">
            <SearchBar onSearch={onSearch} />
          </div>
        )}
      </div>
      
      <MobileCreateButton />
    </header>
  );
}
