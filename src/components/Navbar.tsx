
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
        <div className="h-12 px-4 md:px-6">
          <div className="h-full flex items-center gap-4">
            <NavbarLogo />
            <div className="flex-1 flex items-center gap-4">
              <div className="hidden md:flex flex-1 max-w-md">
                <SearchBar onSearch={onSearch} />
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
