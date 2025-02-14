
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
    <div className="h-full">
      <div className="py-6">
        <div className="flex">
          {/* Colonne de gauche - Aperçu */}
          <div className="w-[250px] flex-shrink-0 pr-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <IconComponent className="h-6 w-6" />
                <h3 className="text-lg font-medium">
                  {category.name}
                </h3>
              </div>
              <Link 
                to={`/category/${category.name.toLowerCase()}`}
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                Voir tout {category.name.toLowerCase()}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
              
              {highlights.services.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Services associés</h4>
                  <ul className="space-y-2">
                    {highlights.services.map(service => (
                      <li key={service}>
                        <Link 
                          to={`/category/${category.name.toLowerCase()}/${service.toLowerCase()}`}
                          className="text-sm text-gray-600 hover:text-primary hover:underline"
                        >
                          {service}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Séparateur vertical */}
          <div className="w-px bg-gray-200/50 mx-4" />

          {/* Colonne de droite - Sous-catégories */}
          <div className="flex-1">
            <ScrollArea className="h-[calc(70vh-120px)] min-h-[300px] pr-4">
              <div className="grid grid-cols-3 gap-8">
                {/* Marques populaires si disponibles */}
                {highlights.brands.length > 0 && (
                  <div className="col-span-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Marques populaires</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {highlights.brands.map(brand => (
                        <Link
                          key={brand}
                          to={`/category/${category.name.toLowerCase()}/marque/${brand.toLowerCase()}`}
                          className="text-sm text-gray-600 hover:text-primary hover:underline"
                        >
                          {brand}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sections principales */}
                {category.subcategories?.map(subcat => (
                  <div key={subcat.id}>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{subcat.name}</h4>
                    <ul className="space-y-2">
                      {subcat.subcategories?.map(subsub => (
                        <li key={subsub.id}>
                          <Link
                            to={`/category/${category.name.toLowerCase()}/${subcat.name.toLowerCase()}/${subsub.name.toLowerCase()}`}
                            className="text-sm text-gray-600 hover:text-primary hover:underline"
                          >
                            {subsub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Types spécifiques si disponibles */}
                {highlights.types.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Types</h4>
                    <ul className="space-y-2">
                      {highlights.types.map(type => (
                        <li key={type}>
                          <Link
                            to={`/category/${category.name.toLowerCase()}/type/${type.toLowerCase()}`}
                            className="text-sm text-gray-600 hover:text-primary hover:underline"
                          >
                            {type}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
