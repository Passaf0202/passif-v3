
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
                <div 
                  className="absolute top-[44px] left-0 right-0 w-screen bg-white/90 backdrop-blur-md shadow-sm animate-in fade-in duration-200 transition-all"
                  style={{ transform: 'translate(-50%, 0)', left: '50%' }}
                >
                  <div className="max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-[2fr,1fr] gap-12 p-8">
                      {/* Colonne principale */}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {category.subcategories.map((sub) => {
                          const IconComponent = getCategoryIcon(category.name);
                          return (
                            <Link
                              key={sub.id}
                              to={`/category/${category.name.toLowerCase()}/${sub.name.toLowerCase()}`}
                              className="flex items-center gap-3 p-2 rounded-lg group transition-colors"
                            >
                              <IconComponent className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                              <span className="text-sm text-gray-600 group-hover:text-primary transition-colors font-light tracking-wide">
                                {sub.name}
                              </span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Colonne liens rapides */}
                      <div className="border-l border-gray-200/50 pl-12">
                        <h3 className="text-xs font-medium uppercase text-gray-400 mb-4">
                          Liens rapides
                        </h3>
                        <div className="space-y-3">
                          <Link 
                            to={`/category/${category.name.toLowerCase()}`}
                            className="block text-sm text-gray-600 hover:text-primary transition-colors font-light tracking-wide"
                          >
                            Toutes les annonces {category.name}
                          </Link>
                          <Link 
                            to={`/category/${category.name.toLowerCase()}/popular`}
                            className="block text-sm text-gray-600 hover:text-primary transition-colors font-light tracking-wide"
                          >
                            Annonces populaires
                          </Link>
                          <Link 
                            to={`/category/${category.name.toLowerCase()}/new`}
                            className="block text-sm text-gray-600 hover:text-primary transition-colors font-light tracking-wide"
                          >
                            Nouvelles annonces
                          </Link>
                        </div>
                      </div>
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
