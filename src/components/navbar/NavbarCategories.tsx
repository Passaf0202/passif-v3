
import { Category } from "@/types/category";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { Link } from "react-router-dom";

interface NavbarCategoriesProps {
  categories: Category[];
}

export function NavbarCategories({ categories }: NavbarCategoriesProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <nav className="hidden md:block w-full border-t border-gray-200/80">
      <div className="max-w-[1440px] mx-auto px-8">
        <ul className="flex items-center h-[44px] -mx-4">
          {categories.map((category) => (
            <li 
              key={category.id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button className="flex items-center gap-1 px-4 h-[44px] text-sm hover:text-primary transition-colors">
                {category.name}
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {hoveredCategory === category.id && category.subcategories && (
                <div className="absolute top-[44px] left-0 w-[300px] bg-white shadow-lg rounded-b-lg border border-gray-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="p-4">
                    <div className="grid gap-1">
                      {category.subcategories.map((sub) => {
                        const IconComponent = getCategoryIcon(category.name);
                        return (
                          <Link
                            key={sub.id}
                            to={`/category/${category.name.toLowerCase()}/${sub.name.toLowerCase()}`}
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
    </nav>
  );
}
