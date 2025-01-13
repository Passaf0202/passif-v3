import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useRef, useEffect } from "react";
import { MobileCategoryItem } from "./mobile/MobileCategoryItem";
import { DesktopCategoryItem } from "./desktop/DesktopCategoryItem";
import { Category } from "@/types/category";
import { X } from "lucide-react";

export const NavbarCategories = () => {
  const isMobile = useIsMobile();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching main categories...");
      const { data: mainCategories, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .order("name");
      
      if (error) throw error;
      
      const categoriesWithSubs = await Promise.all(
        mainCategories.map(async (category) => {
          const { data: subcategories } = await supabase
            .from("categories")
            .select("*")
            .eq("parent_id", category.id)
            .order("name");
          
          return {
            ...category,
            subcategories: subcategories || []
          };
        })
      );
      
      return categoriesWithSubs;
    }
  });

  useEffect(() => {
    if (!isMobile && categories) {
      const updateVisibleCategories = () => {
        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.offsetWidth;
        let currentWidth = 0;
        const tempVisible: Category[] = [];

        categories.forEach((category) => {
          const estimatedWidth = category.name.length * 8 + 48;
          if (currentWidth + estimatedWidth < containerWidth - 100) {
            currentWidth += estimatedWidth;
            tempVisible.push(category);
          }
        });

        setVisibleCategories(tempVisible);
      };

      updateVisibleCategories();
      window.addEventListener('resize', updateVisibleCategories);
      
      return () => {
        window.removeEventListener('resize', updateVisibleCategories);
      };
    } else {
      setVisibleCategories(categories || []);
    }
  }, [categories, isMobile]);

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
            {visibleCategories.map((category, index) => (
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

      {/* Mobile Overlay */}
      {isMobile && openCategory && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpenCategory(null)}
        >
          <button 
            onClick={() => setOpenCategory(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};