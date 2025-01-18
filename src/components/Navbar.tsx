import { SearchBar } from "./SearchBar";
import { NavbarLogo } from "./navbar/NavbarLogo";
import { NavbarActions } from "./navbar/NavbarActions";
import { MobileCreateButton } from "./navbar/MobileCreateButton";
import { useNavigate } from "react-router-dom";
import { CategoryDrawer } from "./navbar/CategoryDrawer";
import { useCategoriesData } from "./navbar/categories/useCategoriesData";
import { CurrencySelector } from "./navbar/CurrencySelector";

export function Navbar() {
  const navigate = useNavigate();
  const { data: categories } = useCategoriesData();

  const onSearch = (query: string) => {
    console.log("Searching for:", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-[1220px] mx-auto">
        <div className="px-2 md:px-4">
          <div className="flex h-16 items-center gap-2 md:gap-4">
            <CategoryDrawer categories={categories || []} />
            <NavbarLogo />
            <div className="hidden md:flex flex-1 max-w-2xl">
              <SearchBar onSearch={onSearch} />
            </div>
            <CurrencySelector />
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