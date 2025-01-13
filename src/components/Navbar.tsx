import { SearchBar } from "./SearchBar";
import { NavbarLogo } from "./navbar/NavbarLogo";
import { NavbarActions } from "./navbar/NavbarActions";
import { NavbarCategories } from "./navbar/NavbarCategories";
import { MobileCreateButton } from "./navbar/MobileCreateButton";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();

  const onSearch = (query: string) => {
    console.log("Searching for:", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b">
      {/* Top Navigation Bar */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo and Search Section */}
            <div className="flex items-center gap-4 flex-1">
              <NavbarLogo />
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:flex flex-1 max-w-2xl">
                <SearchBar onSearch={onSearch} />
              </div>
            </div>
            <NavbarActions />
          </div>
        </div>
      </div>

      {/* Search Bar - Mobile Only */}
      <div className="md:hidden px-4 py-2 border-t">
        <SearchBar onSearch={onSearch} />
      </div>
      
      <NavbarCategories />
      <MobileCreateButton />
    </div>
  );
}