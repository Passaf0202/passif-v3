import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { MobileCategoryItem } from "./mobile/MobileCategoryItem";
import { DesktopCategoryItem } from "./desktop/DesktopCategoryItem";
import { Category } from "@/types/category";

export const NavbarCategories = () => {
  const isMobile = useIsMobile();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  
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

  const handleCategoryClick = (categoryName: string) => {
    if (isMobile) {
      setOpenCategory(openCategory === categoryName ? null : categoryName);
    }
  };

  const formatCategoryName = (name: string) => {
    return name.toLowerCase();
  };

  return (
    <div className="sticky top-16 z-40 border-t bg-white">
      <div className="max-w-[1220px] mx-auto">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex px-4 py-2 gap-4 items-center min-w-0">
            {categories?.map((category, index) => (
              <div 
                key={category.id} 
                className={`shrink-0 ${index === 0 ? 'pl-0' : ''} ${
                  index === categories.length - 1 ? 'ml-auto' : ''
                }`}
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
    </div>
  );
};