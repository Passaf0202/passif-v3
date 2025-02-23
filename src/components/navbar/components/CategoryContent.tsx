
import React from "react";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Baby, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategoryIcon } from "@/utils/categoryIcons";

export function CategoryContent({ category }: { category: Category }) {
  const Icon = getCategoryIcon(category.name);

  return (
    <div className="bg-white">
      <div className="p-6 md:p-8">
        {/* En-tête de catégorie */}
        <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
          <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg text-gray-900">{capitalizeFirstLetter(category.name)}</h3>
            <Link
              to={`/category/${category.id}`}
              className="text-sm text-primary hover:text-primary/90 font-medium mt-1 inline-flex items-center gap-1"
            >
              Tout explorer
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Grille des sous-catégories */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {category.subcategories?.map((section) => (
            <div key={section.id} className="space-y-4">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-base text-gray-900">
                  {capitalizeFirstLetter(section.name)}
                </h4>
                {section.subcategories && section.subcategories.length > 0 && (
                  <Link
                    to={`/category/${section.id}`}
                    className="text-xs text-primary hover:text-primary/90 font-medium inline-flex items-center gap-1"
                  >
                    Voir tout
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                {section.subcategories?.map((subsection) => (
                  <Link
                    key={subsection.id}
                    to={`/search?category=${encodeURIComponent(subsection.id)}`}
                    className="block text-[15px] text-gray-600 hover:text-primary transition-colors duration-200 py-0.5"
                  >
                    {capitalizeFirstLetter(subsection.name)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer avec lien vers toute la catégorie */}
      <div className="bg-gray-50/80 border-t border-gray-100">
        <div className="px-6 py-4 md:px-8 md:py-5">
          <Link
            to={`/category/${category.id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
          >
            <span>Voir tous les articles dans {category.name.toLowerCase()}</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
