
import React from "react";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CategoryContent({ category }: { category: Category }) {
  return (
    <div className="p-8">
      <div className="grid grid-cols-3 gap-8">
        <div>
          <h3 className="font-medium text-lg mb-4">{capitalizeFirstLetter(category.name)}</h3>
          <div className="space-y-2">
            {category.subcategories?.map((subcategory) => (
              <Link
                key={subcategory.id}
                to={`/search?category=${encodeURIComponent(subcategory.id)}`}
                className="block text-gray-600 hover:text-primary"
              >
                {capitalizeFirstLetter(subcategory.name)}
              </Link>
            ))}
            <Link
              to={`/category/${category.id}`}
              className="inline-flex items-center text-primary hover:text-primary/90 mt-2"
            >
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        {/* Autres colonnes pour les sous-catégories groupées */}
        {category.subcategories && category.subcategories.length > 0 && (
          <>
            <div>
              <h3 className="font-medium text-lg mb-4">Populaires</h3>
              <div className="space-y-2">
                {category.subcategories.slice(0, 5).map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    to={`/search?category=${encodeURIComponent(subcategory.id)}`}
                    className="block text-gray-600 hover:text-primary"
                  >
                    {capitalizeFirstLetter(subcategory.name)}
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Services associés</h3>
              <div className="space-y-2">
                {category.subcategories.slice(-5).map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    to={`/search?category=${encodeURIComponent(subcategory.id)}`}
                    className="block text-gray-600 hover:text-primary"
                  >
                    {capitalizeFirstLetter(subcategory.name)}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
