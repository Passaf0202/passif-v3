
import { SearchBar } from "./SearchBar";
import { NavbarLogo } from "./navbar/NavbarLogo";
import { NavbarActions } from "./navbar/NavbarActions";
import { MobileCreateButton } from "./navbar/MobileCreateButton";
import { useNavigate } from "react-router-dom";
import { CategoryDrawer } from "./navbar/CategoryDrawer";
import { useCategoriesData } from "./navbar/categories/useCategoriesData";

export function Navbar() {
  const navigate = useNavigate();
  const { data: categories } = useCategoriesData();

  const onSearch = (query: string) => {
    console.log("Searching for:", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
      <div className="max-w-[1440px] mx-auto">
        <div className="px-4 md:px-8">
          <div className="flex h-[44px] items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <NavbarLogo />
              <CategoryDrawer categories={categories || []} />
            </div>
            
            <div className="hidden md:flex flex-1 max-w-lg justify-center">
              <SearchBar onSearch={onSearch} />
            </div>
            
            <NavbarActions />
          </div>
        </div>

        <div className="md:hidden px-4 py-2">
          <SearchBar onSearch={onSearch} />
        </div>
      </div>
      <MobileCreateButton />
    </div>
  );
}
