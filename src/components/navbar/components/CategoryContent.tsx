
import { Category } from "@/types/category";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="grid grid-cols-4 gap-8">
        {/* Section principale */}
        <div className="col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-xl font-medium">{category.name}</div>
          </div>
          <Link 
            to={`/category/${category.name.toLowerCase()}`}
            className="text-sm text-primary hover:underline inline-flex items-center"
          >
            Voir tout
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {/* Marques populaires */}
        {highlights.brands.length > 0 && (
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">
              Marques populaires
            </h3>
            <div className="space-y-3">
              {highlights.brands.map(brand => (
                <Link
                  key={brand}
                  to={`/category/${category.name.toLowerCase()}/marque/${brand.toLowerCase()}`}
                  className="block text-gray-700 hover:text-primary"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Types */}
        {highlights.types.length > 0 && (
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Types</h3>
            <div className="space-y-3">
              {highlights.types.map(type => (
                <Link
                  key={type}
                  to={`/category/${category.name.toLowerCase()}/type/${type.toLowerCase()}`}
                  className="block text-gray-700 hover:text-primary"
                >
                  {type}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sous-catégories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Catégories</h3>
            <div className="space-y-3">
              {category.subcategories.map(subcat => (
                <Link
                  key={subcat.id}
                  to={`/category/${category.name.toLowerCase()}/${subcat.name.toLowerCase()}`}
                  className="block text-gray-700 hover:text-primary"
                >
                  {subcat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
