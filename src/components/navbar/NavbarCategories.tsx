import { useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCategoryItem } from "./mobile/MobileCategoryItem";
import { DesktopCategoryItem } from "./desktop/DesktopCategoryItem";
import { MobileOverlay } from "./categories/MobileOverlay";
import { useCategoriesData } from "./categories/useCategoriesData";
import { useVisibleCategories } from "./categories/useVisibleCategories";

export const NavbarCategories = () => {
  const isMobile = useIsMobile();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: categories } = useCategoriesData();
  const visibleCategories = useVisibleCategories(categories, isMobile, containerRef);

  const handleCategoryClick = (categoryName: string) => {
    if (isMobile) {
      setOpenCategory(openCategory === categoryName ? null : categoryName);
    }
  };

  const formatCategoryName = (name: string) => {
    return name.toLowerCase();
  };

  return (
    <div className="sticky top-16 z-[60] border-t bg-white">
      <div className="max-w-[1220px] mx-auto">
        <div ref={containerRef} className="overflow-x-auto no-scrollbar">
          <div className="flex px-4 py-2 gap-6 items-center justify-between">
            {visibleCategories.map((category) => (
              <div 
                key={category.id} 
                className="shrink-0"
              >
                {isMobile ? (
                  <MobileCategoryItem
                    category={category}
                    openCategory={openCategory}
                    handleCategoryClick={handleCategoryClick}
                    formatCategoryName={formatCategoryName}
                  />
                ) : (
                  <DesktopCategoryItem
                    category={category}
                    handleCategoryClick={handleCategoryClick}
                    formatCategoryName={formatCategoryName}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileOverlay 
        isOpen={!!openCategory && isMobile} 
        onClose={() => setOpenCategory(null)} 
      />
    </div>
  );
};