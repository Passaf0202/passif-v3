
import { Category } from "@/types/category";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarCategoriesProps {
  categories: Category[];
}

export function NavbarCategories({ categories }: NavbarCategoriesProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <nav className="hidden md:block w-full border-t border-gray-200/20">
      <div className="max-w-[1440px] mx-auto px-8">
        <ul className="flex items-center h-[44px] -mx-4">
          {categories.map((category) => (
            <li 
              key={category.id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button className="flex items-center gap-1 px-4 h-[44px] text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
                {category.name}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              
              {hoveredCategory === category.id && category.subcategories && (
                <div 
                  className="absolute top-[44px] left-0 right-0 w-screen bg-white/60 backdrop-blur-sm animate-in fade-in duration-300"
                  style={{ transform: 'translate(-50%, 0)', left: '50%' }}
                >
                  <div className="max-w-[1440px] mx-auto py-6">
                    <div className="grid grid-cols-[1.5fr,1fr] gap-16 px-8">
                      <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/category/${category.name.toLowerCase()}/${sub.name.toLowerCase()}`}
                            className="py-1.5 text-[13px] text-gray-500 hover:text-gray-900 transition-colors duration-300 font-light tracking-wide"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>

                      <div>
                        <h3 className="text-[11px] font-medium uppercase text-gray-400 tracking-wider mb-3">
                          Liens rapides
                        </h3>
                        <div className="space-y-2">
                          <Link 
                            to={`/category/${category.name.toLowerCase()}`}
                            className="block text-[13px] text-gray-500 hover:text-gray-900 transition-colors duration-300 font-light tracking-wide"
                          >
                            Toutes les annonces {category.name}
                          </Link>
                          <Link 
                            to={`/category/${category.name.toLowerCase()}/popular`}
                            className="block text-[13px] text-gray-500 hover:text-gray-900 transition-colors duration-300 font-light tracking-wide"
                          >
                            Annonces populaires
                          </Link>
                          <Link 
                            to={`/category/${category.name.toLowerCase()}/new`}
                            className="block text-[13px] text-gray-500 hover:text-gray-900 transition-colors duration-300 font-light tracking-wide"
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
