
import { Category } from "@/types/category";
import { useState, useRef } from "react";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { Link } from "react-router-dom";
import { useOrganizedCategories } from "./categories/useOrganizedCategories";
import { useVisibleCategories } from "./categories/useVisibleCategories";
import { ChevronRight } from "lucide-react";

interface NavbarCategoriesProps {
  categories: Category[];
  isMobile?: boolean;
}

interface CategoryHighlight {
  brands: string[];
  sections: string[];
  types: string[];
  services: string[];
}

const CATEGORY_HIGHLIGHTS: Record<string, CategoryHighlight> = {
  "Véhicules": {
    brands: ["Peugeot", "Renault", "Volkswagen", "BMW", "Mercedes", "Audi"],
    sections: ["Voitures", "Motos", "Caravaning", "Utilitaires"],
    types: [],
    services: []
  },
  "Mode": {
    brands: [],
    sections: ["Vêtements", "Chaussures", "Accessoires", "Montres & Bijoux"],
    types: ["Femme", "Homme", "Enfant"],
    services: []
  },
  "Immobilier": {
    brands: [],
    sections: [],
    types: ["Vente", "Location", "Colocation", "Bureaux & Commerces"],
    services: ["Évaluation immobilière", "Diagnostic"]
  }
};

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

  const renderCategoryContent = (category: Category) => {
    const highlights = CATEGORY_HIGHLIGHTS[category.name] || {
      brands: [],
      sections: [],
      types: [],
      services: []
    };
    const IconComponent = getCategoryIcon(category.name);

    return (
      <div className="grid grid-cols-[250px_1fr] h-full">
        {/* Colonne de gauche - Aperçu */}
        <div className="bg-gray-50 p-6 border-r border-gray-200/80">
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

        {/* Colonne de droite - Sous-catégories */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            {/* Marques populaires si disponibles */}
            {highlights.brands.length > 0 && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Marques populaires</h4>
                <div className="grid grid-cols-3 gap-3">
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
        </div>
      </div>
    );
  };

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

                {hoveredCategory === category.id && (
                  <div className={`absolute top-[44px] ${
                    index === displayedCategories.length - 1 ? 'right-0' : 
                    index === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'
                  } w-[800px] bg-white shadow-lg rounded-lg border border-gray-200/80 animate-in fade-in slide-in-from-top-1 duration-200 z-50`}>
                    {renderCategoryContent(category)}
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
