
import { SearchBar } from "./SearchBar";
import { NavbarLogo } from "./navbar/NavbarLogo";
import { NavbarActions } from "./navbar/NavbarActions";
import { useNavigate } from "react-router-dom";
import { NavbarCategories } from "./navbar/NavbarCategories";
import { useCategoriesData } from "./navbar/categories/useCategoriesData";
import { useRef } from "react";
import { useAdaptiveLayout } from "@/hooks/use-adaptive-layout";
import { MobileCategoryBar } from "./navbar/MobileCategoryBar";
import { MobileMenu } from "./navbar/mobile/MobileMenu";

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
        <div className="h-12 px-4 md:px-8 border-b border-gray-200/80">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-[1200px] grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-6">
              {isMobile ? (
                <>
                  {/* Mobile Menu Button à gauche */}
                  <div className="flex-shrink-0">
                    <MobileMenu />
                  </div>

                  {/* Logo au centre */}
                  <div className="flex justify-center">
                    <div className="scale-95 transition-transform duration-200 min-w-[140px]">
                      <NavbarLogo />
                    </div>
                  </div>

                  {/* Actions à droite */}
                  <div className="flex-shrink-0">
                    <NavbarActions />
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-auto flex-shrink-0 transition-all duration-200`}>
                    <NavbarLogo />
                  </div>
                  <div className="flex justify-start md:justify-center w-full">
                    <div className={isMobile ? "hidden" : "w-full max-w-xl"}>
                      <SearchBar onSearch={onSearch} />
                    </div>
                  </div>
                  <NavbarActions />
                </>
              )}
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

        {/* Mobile category bar */}
        <MobileCategoryBar />
      </div>
    </header>
  );
}
