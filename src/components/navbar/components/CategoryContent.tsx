
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
      {/* Section Aperçu */}
      <div className="bg-gray-50 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          {IconComponent && <IconComponent className="h-8 w-8" />}
          <h2 className="text-xl font-medium">{category.name}</h2>
        </div>
        <Link 
          to={`/category/${category.name.toLowerCase()}`}
          className="inline-flex items-center text-primary hover:underline"
        >
          Voir tout {category.name.toLowerCase()}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      {/* Section Marques Populaires */}
      {highlights.brands.length > 0 && (
        <div className="px-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
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

      {/* Section Types */}
      {highlights.types.length > 0 && (
        <div className="px-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Types</h3>
          <div className="space-y-2">
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

      {/* Services associés */}
      {highlights.services.length > 0 && (
        <div className="px-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Services associés</h3>
          <div className="space-y-2">
            {highlights.services.map(service => (
              <Link
                key={service}
                to={`/category/${category.name.toLowerCase()}/${service.toLowerCase()}`}
                className="block text-gray-600 hover:text-primary"
              >
                {service}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sous-catégories */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="px-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Catégories</h3>
          <div className="space-y-2">
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
  );
}
