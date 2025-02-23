
import React from "react";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Home, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategoryIcon } from "@/utils/categoryIcons";

export function CategoryContent({ category }: { category: Category }) {
  const Icon = getCategoryIcon(category.name);

  return (
    <div className="p-8 bg-white">
      <div className="grid grid-cols-4 gap-12">
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Icon className="h-5 w-5" />
            <h3 className="font-medium text-lg">{capitalizeFirstLetter(category.name)}</h3>
          </div>
          <div className="space-y-3">
            <Link
              to={`/category/${category.id}`}
              className="inline-flex items-center text-primary hover:text-primary/90 font-medium"
            >
              {`Tout ${category.name.toLowerCase()}`}
            </Link>
          </div>
        </div>

        <div className="col-span-3 grid grid-cols-3 gap-8">
          {category.subcategories?.map((section, index) => (
            <div key={section.id} className="space-y-4">
              <h4 className="font-medium text-base">{capitalizeFirstLetter(section.name)}</h4>
              <div className="space-y-2.5">
                {section.subcategories?.map((subsection) => (
                  <Link
                    key={subsection.id}
                    to={`/search?category=${encodeURIComponent(subsection.id)}`}
                    className="block text-gray-600 hover:text-primary text-sm"
                  >
                    {capitalizeFirstLetter(subsection.name)}
                  </Link>
                ))}
              </div>
              {index === 0 && section.subcategories && section.subcategories.length > 0 && (
                <Link
                  to={`/category/${section.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/90 text-sm"
                >
                  Voir tout
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
