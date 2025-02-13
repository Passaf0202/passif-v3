
import { SearchBar } from "./SearchBar";
import { NavbarLogo } from "./navbar/NavbarLogo";
import { NavbarActions } from "./navbar/NavbarActions";
import { MobileCreateButton } from "./navbar/MobileCreateButton";
import { useNavigate } from "react-router-dom";
import { NavbarCategories } from "./navbar/NavbarCategories";
import { useCategoriesData } from "./navbar/categories/useCategoriesData";

export function Navbar() {
  const navigate = useNavigate();
  const {
    data: categories
  } = useCategoriesData();

  const onSearch = (query: string) => {
    console.log("Searching for:", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
      <div className="max-w-[1440px] mx-auto">
        {/* Top section */}
        <div className="h-12 px-4 md:px-8">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-[1200px] grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8">
              <div className="w-auto flex-shrink-0">
                <NavbarLogo />
              </div>
              <div className="flex justify-start md:justify-center w-full">
                <div className="hidden md:block w-full max-w-md">
                  <SearchBar onSearch={onSearch} />
                </div>
              </div>
              <NavbarActions />
            </div>
          </div>
        </div>

        {/* Categories section */}
        <NavbarCategories categories={categories || []} />

        {/* Mobile search */}
        <div className="md:hidden px-4 py-2">
          <SearchBar onSearch={onSearch} />
        </div>
      </div>
      
      <MobileCreateButton />
    </header>
  );
}
