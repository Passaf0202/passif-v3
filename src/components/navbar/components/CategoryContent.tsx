
import { Category } from "@/types/category";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { CATEGORY_HIGHLIGHTS } from "../constants/categoryHighlights";
import { CategoryHighlight } from "../types/categories";

interface CategoryContentProps {
  category: Category;
}

export function CategoryContent({ category }: CategoryContentProps) {
  const highlights = CATEGORY_HIGHLIGHTS[category.name] || {
    brands: [],
    sections: [],
    types: [],
    services: []
  } as CategoryHighlight;

  const IconComponent = getCategoryIcon(category.name);

  return (
    <div className="h-full bg-white">
      {/* En-tête de catégorie */}
      <div className="bg-white p-6 mb-4 flex items-center gap-3">
        {IconComponent && <IconComponent className="h-8 w-8" />}
        <div>
          <h2 className="text-xl font-medium mb-1">{category.name}</h2>
          <Link 
            to={`/category/${category.name.toLowerCase()}`}
            className="text-sm text-primary hover:underline inline-flex items-center"
          >
            Voir tout
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="px-6 space-y-8">
          {/* Marques populaires */}
          {highlights.brands.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Marques populaires
              </h3>
              <div className="flex flex-wrap gap-2">
                {highlights.brands.map(brand => (
                  <Link
                    key={brand}
                    to={`/category/${category.name.toLowerCase()}/marque/${brand.toLowerCase()}`}
                    className="bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Types */}
          {highlights.types.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Types</h3>
              <div className="space-y-3">
                {highlights.types.map(type => (
                  <Link
                    key={type}
                    to={`/category/${category.name.toLowerCase()}/type/${type.toLowerCase()}`}
                    className="block text-base text-gray-600 hover:text-primary"
                  >
                    {type}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sous-catégories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Catégories</h3>
              <div className="space-y-3">
                {category.subcategories.map(subcat => (
                  <Link
                    key={subcat.id}
                    to={`/category/${category.name.toLowerCase()}/${subcat.name.toLowerCase()}`}
                    className="block text-base text-gray-600 hover:text-primary"
                  >
                    {subcat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
