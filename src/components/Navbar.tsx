
import { SearchBar } from "./SearchBar";
import { NavbarLogo } from "./navbar/NavbarLogo";
import { NavbarActions } from "./navbar/NavbarActions";
import { useNavigate } from "react-router-dom";
import { NavbarCategories } from "./navbar/NavbarCategories";
import { useCategoriesData } from "./navbar/categories/useCategoriesData";
import { useRef } from "react";
import { useAdaptiveLayout } from "@/hooks/use-adaptive-layout";
import { MobileMenu } from "./navbar/mobile/MobileMenu";
import { MobileCategoryBar } from "./navbar/MobileCategoryBar";

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
            {isMobile ? (
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
                  <button className="rounded-full flex items-center justify-center h-8 w-8">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18.125 5H3.125C2.43464 5 1.875 5.55964 1.875 6.25V15C1.875 15.6904 2.43464 16.25 3.125 16.25H18.125C18.8154 16.25 19.375 15.6904 19.375 15V6.25C19.375 5.55964 18.8154 5 18.125 5Z" />
                      <path d="M1.875 8.75H19.375" />
                      <path d="M15 12.5H16.25" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full grid grid-cols-[1fr,3fr,1fr] items-center gap-8">
                {/* Logo à gauche */}
                <div className="flex-shrink-0">
                  <NavbarLogo />
                </div>

                {/* Barre de recherche au centre */}
                <div className="w-full max-w-3xl mx-auto">
                  <SearchBar onSearch={onSearch} />
                </div>

                {/* Actions à droite */}
                <div className="flex justify-end">
                  <NavbarActions />
                </div>
              </div>
            )}
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

        {/* Mobile category bar */}
        {isMobile && <MobileCategoryBar />}
      </div>
    </header>
  );
}
