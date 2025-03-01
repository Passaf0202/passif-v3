
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { useRef, useEffect } from "react";

export function MobileCategoryBar() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Désactiver l'effet de rebond sur iOS en utilisant CSS
    container.style.overscrollBehavior = "none";
    
    // Pour une meilleure compatibilité avec les navigateurs plus anciens
    container.style.webkitOverflowScrolling = "touch";
    container.style.scrollBehavior = "smooth";
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/category/${categoryName.toLowerCase()}`);
  };

  if (!categories?.length) return null;

  return (
    <div className="md:hidden border-t border-b border-gray-200/80 bg-white">
      <div 
        ref={scrollContainerRef} 
        className="overflow-x-auto whitespace-nowrap no-scrollbar"
        style={{ 
          overscrollBehavior: "none", 
          WebkitOverflowScrolling: "touch" 
        }}
      >
        <div className="flex items-center">
          {categories.map((category) => {
            const CategoryIcon = getCategoryIcon(category.name);
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className="whitespace-nowrap px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <CategoryIcon className="w-4 h-4" />
                <span>{capitalizeFirstLetter(category.name)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
