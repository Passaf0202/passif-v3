
import { Category } from "@/types/category";
import { useState, useRef } from "react";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { Link } from "react-router-dom";
import { useOrganizedCategories } from "./categories/useOrganizedCategories";
import { useVisibleCategories } from "./categories/useVisibleCategories";

interface NavbarCategoriesProps {
  categories: Category[];
  isMobile?: boolean;
}

export function NavbarCategories({
  categories,
  isMobile
}: NavbarCategoriesProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
    <nav className="w-full border-b border-gray-200/80">
      <div className="max-w-[1440px] h-12 mx-auto px-4 md:px-8">
        <div className="h-full flex items-center justify-center" ref={containerRef}>
          <ul className="inline-flex items-center gap-1">
            {displayedCategories.map((category, index) => (
              <li 
                key={category.id} 
                className="relative flex items-center text-[13px] text-gray-700"
                onMouseEnter={() => setHoveredCategory(category.id)} 
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button className="px-3 py-2 hover:text-primary transition-colors whitespace-nowrap">
                  {category.name}
                </button>
                
                {index < displayedCategories.length - 1 && (
                  <span className="text-gray-400 select-none">•</span>
                )}

                {hoveredCategory === category.id && category.subcategories && (
                  <div className={`absolute top-[44px] ${index === displayedCategories.length - 1 ? 'right-0' : index === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'} w-[300px] bg-white shadow-lg rounded-b-lg border border-gray-200/80 animate-in fade-in slide-in-from-top-1 duration-200 z-50`}>
                    <div className="p-4">
                      <div className="grid gap-1">
                        {category.subcategories.map(sub => {
                          const IconComponent = getCategoryIcon(category.name === "Autres" ? sub.name : category.name);
                          return (
                            <Link 
                              key={sub.id} 
                              to={`/category/${category.name === "Autres" ? sub.name.toLowerCase() : category.name.toLowerCase()}/${sub.name.toLowerCase()}`} 
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <IconComponent className="h-5 w-5 text-primary" />
                              <span className="text-sm">{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
