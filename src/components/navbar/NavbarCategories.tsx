
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useOrganizedCategories } from "./categories/useOrganizedCategories";
import { useVisibleCategories } from "./categories/useVisibleCategories";
import { useMenuState } from "./hooks/useMenuState";
import { CategoryContent } from "./components/CategoryContent";
import { NavbarCategoriesProps } from "./types/categories";

export function NavbarCategories({
  categories,
  isMobile
}: NavbarCategoriesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLLIElement | null>>({});
  
  const {
    menuState,
    menuRef,
    menuZoneRef,
    handleCategoryEnter,
    handleMenuZoneEnter,
    handleMenuZoneLeave
  } = useMenuState();

  const organizedCategories = useOrganizedCategories(categories);
  const visibleCategories = useVisibleCategories(organizedCategories, !!isMobile, containerRef);

  const hiddenCategories = organizedCategories.filter(
    cat => !visibleCategories.find(visible => visible.id === cat.id)
  );

  const othersCategory = hiddenCategories.length > 0 ? {
    id: "others",
    name: "Autres",
    subcategories: hiddenCategories
  } : null;

  const displayedCategories = othersCategory 
    ? [...visibleCategories, othersCategory]
    : visibleCategories;

  if (isMobile) {
    return null;
  }

  return (
    <nav className="relative w-full border-b border-gray-200/80">
      <div className="max-w-[1440px] h-12 mx-auto px-4 md:px-8">
        <div className="h-full flex items-center justify-center" ref={containerRef}>
          <ul className="inline-flex items-center gap-1">
            {displayedCategories.map((category, index) => (
              <li 
                key={category.id} 
                ref={el => categoryRefs.current[category.id] = el}
                className={`relative flex items-center text-[13px] ${
                  menuState.currentCategory === category.id 
                    ? 'text-primary' 
                    : 'text-gray-700'
                }`}
                onMouseEnter={() => handleCategoryEnter(category.id)}
              >
                <button 
                  className={`px-3 py-2 hover:text-primary transition-colors whitespace-nowrap ${
                    menuState.currentCategory === category.id ? 'font-medium' : ''
                  }`}
                >
                  {category.name}
                </button>
                
                {index < displayedCategories.length - 1 && (
                  <span className="text-gray-400 select-none">•</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {menuState.isOpen && (
        <>
          <div
            ref={menuZoneRef}
            className="fixed inset-0 z-40"
            onMouseEnter={handleMenuZoneEnter}
            onMouseLeave={handleMenuZoneLeave}
          >
            {/* Backdrop avec flou uniquement au-dessus de la zone des catégories */}
            <div className="fixed inset-0">
              <div className="absolute inset-0 bottom-12 bg-black/5 backdrop-blur-[1px]" />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/80" />
            </div>
            
            <div 
              ref={menuRef}
              className={`fixed left-0 right-0 bg-white border-b border-gray-200/80 shadow-sm transition-all duration-300 ease-in-out ${
                menuState.isTransitioning ? 'opacity-90' : 'opacity-100'
              }`}
              style={{ top: '96px' }}
            >
              {menuState.currentCategory && (
                <CategoryContent
                  category={displayedCategories.find(cat => cat.id === menuState.currentCategory)!}
                />
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
