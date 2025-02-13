
import { Category } from "@/types/category";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { Link } from "react-router-dom";
import { useOrganizedCategories } from "./categories/useOrganizedCategories";

interface NavbarCategoriesProps {
  categories: Category[];
}

export function NavbarCategories({ categories }: NavbarCategoriesProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const organizedCategories = useOrganizedCategories(categories);

  return (
    <nav className="hidden md:block">
      <ul className="flex items-center h-[44px] mx-[-0.75rem]">
        {organizedCategories.map((category, index) => (
          <li 
            key={category.id}
            className={`relative flex-1 ${index === 0 ? 'pl-0' : ''} ${
              index === organizedCategories.length - 1 ? 'pr-0' : ''
            }`}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <button className="flex items-center gap-1 px-3 h-[44px] text-sm hover:text-primary transition-colors whitespace-nowrap">
              {category.name}
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {hoveredCategory === category.id && category.subcategories && (
              <div className="absolute top-[44px] left-0 w-[300px] bg-white shadow-lg rounded-b-lg border border-gray-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="p-4">
                  <div className="grid gap-1">
                    {category.subcategories.map((sub) => {
                      const IconComponent = getCategoryIcon(
                        category.name === "Autres" ? sub.name : category.name
                      );
                      return (
                        <Link
                          key={sub.id}
                          to={`/category/${
                            category.name === "Autres" 
                              ? sub.name.toLowerCase() 
                              : category.name.toLowerCase()
                          }/${sub.name.toLowerCase()}`}
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
    </nav>
  );
}
