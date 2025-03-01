
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { getCategoryIcon } from "@/utils/categoryIcons";

export function MobileCategoryBar() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

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
    // Désactiver l'effet de rebond sur le défilement horizontal
    const container = containerRef.current;
    if (!container) return;

    // Appliquer les styles directement
    Object.assign(container.style, {
      overflowX: "auto",
      scrollBehavior: "smooth",
      overscrollBehaviorX: "none", // Empêche le rebond sur les navigateurs modernes
    });

    // Empêcher le comportement par défaut de défilement avec inertie
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/category/${categoryName.toLowerCase()}`);
  };

  if (!categories?.length) return null;

  return (
    <div className="md:hidden border-t border-b border-gray-200/80 bg-white relative">
      <div 
        ref={containerRef} 
        className="categories-container flex overflow-x-auto no-scrollbar relative"
      >
        {categories.map((category) => {
          const CategoryIcon = getCategoryIcon(category.name);
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              className="whitespace-nowrap px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors flex-shrink-0 flex items-center gap-1.5"
            >
              <CategoryIcon className="w-4 h-4" />
              <span>{capitalizeFirstLetter(category.name)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
