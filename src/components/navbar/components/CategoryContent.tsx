
import { Category } from "@/types/category";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { CATEGORY_HIGHLIGHTS } from "../constants/categoryHighlights";
import { CategoryHighlight } from "../types/categories";
import { getCategoryIcon } from "@/utils/categoryIcons"; // Ajout de l'import manquant

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

  const Icon = getCategoryIcon(category.name);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-16">
        {/* Section principale */}
        <div className="w-64">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              {Icon && <Icon className="h-6 w-6 text-gray-600" />}
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
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-3 gap-12">
            {/* Marques populaires */}
            {highlights.brands.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Marques populaires
                </h3>
                <div className="space-y-3">
                  {highlights.brands.map(brand => (
                    <Link
                      key={brand}
                      to={`/category/${category.name.toLowerCase()}/marque/${brand.toLowerCase()}`}
                      className="block text-gray-600 hover:text-primary"
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
                <h3 className="text-lg font-semibold mb-4">Types</h3>
                <div className="space-y-3">
                  {highlights.types.map(type => (
                    <Link
                      key={type}
                      to={`/category/${category.name.toLowerCase()}/type/${type.toLowerCase()}`}
                      className="block text-gray-600 hover:text-primary"
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
                <h3 className="text-lg font-semibold mb-4">Catégories</h3>
                <div className="space-y-3">
                  {category.subcategories.map(subcat => (
                    <Link
                      key={subcat.id}
                      to={`/category/${category.name.toLowerCase()}/${subcat.name.toLowerCase()}`}
                      className="block text-gray-600 hover:text-primary"
                    >
                      {subcat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
