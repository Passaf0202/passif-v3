import { useRef } from "react";
import { useOrganizedCategories } from "./categories/useOrganizedCategories";
import { useVisibleCategories } from "./categories/useVisibleCategories";
import { useMenuState } from "./hooks/useMenuState";
import { CategoryContent } from "./components/CategoryContent";
import { NavbarCategoriesProps } from "./types/categories";

export function NavbarCategories({
  categories = [],
  isMobile
}: NavbarCategoriesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const menuContainerRef = useRef<HTMLUListElement>(null);
  
  const {
    menuState,
    menuRef,
    menuZoneRef,
    handleCategoryEnter,
    handleMenuZoneEnter,
    handleMenuZoneLeave,
    handleBackdropClick,
    closeMenu
  } = useMenuState();

  const organizedCategories = useOrganizedCategories(categories);
  const visibleCategories = useVisibleCategories(organizedCategories, !!isMobile, containerRef);

  const hiddenCategories = organizedCategories?.filter(
    cat => !visibleCategories?.find(visible => visible?.id === cat?.id)
  ) || [];

  const othersCategory = hiddenCategories.length > 0 ? {
    id: "others",
    name: "Autres",
    subcategories: hiddenCategories
  } : null;

  const displayedCategories = othersCategory 
    ? [...(visibleCategories || []), othersCategory]
    : (visibleCategories || []);

  if (isMobile) {
    return null;
  }

  const currentCategory = displayedCategories.find(cat => cat?.id === menuState.currentCategory);

  return (
    <nav className="relative w-full border-b border-gray-200/80">
      <div className="sticky top-0 z-51 bg-white border-b border-gray-200/80">
        <div className="max-w-[1440px] h-12 mx-auto px-4 md:px-8">
          <div className="h-full flex items-center justify-center" ref={containerRef}>
            <ul className="inline-flex items-center gap-1" ref={menuContainerRef}>
              {displayedCategories.map((category, index) => (
                category && (
                  <li 
                    key={category.id} 
                    ref={el => categoryRefs.current[category.id] = el}
                    className={`relative flex items-center text-[13px] ${
                      menuState.currentCategory === category.id 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 hover:text-primary'
                    }`}
                    onMouseEnter={() => handleCategoryEnter(category.id)}
                  >
                    <button 
                      className={`px-3 py-2 transition-colors whitespace-nowrap ${
                        menuState.currentCategory === category.id 
                          ? 'bg-primary/5 rounded-md' 
                          : ''
                      }`}
                    >
                      {category.name}
                    </button>
                    
                    {index < displayedCategories.length - 1 && (
                      <span className="text-gray-400 select-none">•</span>
                    )}
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>
      </div>

      {menuState.isOpen && currentCategory && (
        <div 
          ref={menuRef}
          className="fixed inset-0 z-[100]"
          style={{ top: '96px' }}
          onMouseLeave={handleMenuZoneLeave}
          onClick={handleBackdropClick}
        >
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
          
          <div className="relative max-w-[1440px] mx-auto px-4 md:px-8">
            <div 
              ref={menuZoneRef}
              className="bg-white border border-gray-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-b-2xl backdrop-blur-sm"
              style={{ 
                width: menuContainerRef.current?.offsetWidth,
                marginLeft: menuContainerRef.current?.offsetLeft ? menuContainerRef.current.offsetLeft - 32 : 0
              }}
              onMouseEnter={handleMenuZoneEnter}
              onClick={(e) => e.stopPropagation()}
            >
              <CategoryContent category={currentCategory} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
