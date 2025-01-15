import { Category } from "@/types/category";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { capitalizeFirstLetter } from "../../../utils/textUtils";

interface SubcategoryListProps {
  category: Category;
  onBackClick: () => void;
  onSubcategoryClick: (subcategory: Category) => void;
}

export function SubcategoryList({ 
  category, 
  onBackClick, 
  onSubcategoryClick 
}: SubcategoryListProps) {
  const IconComponent = getCategoryIcon(category.name);

  return (
    <div className="p-4 space-y-2">
      <button
        onClick={onBackClick}
        className="flex items-center gap-2 text-sm text-primary mb-6 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux catégories
      </button>
      <div className="flex items-center gap-2 mb-6">
        <IconComponent className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{capitalizeFirstLetter(category.name)}</h2>
      </div>
      <Link
        to={`/category/${category.name.toLowerCase()}`}
        className="block w-full text-left p-3 text-primary hover:bg-gray-100 rounded-lg transition-colors"
      >
        Voir tout
      </Link>
      <div className="grid gap-2 mt-4">
        {category.subcategories?.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => onSubcategoryClick(subcategory)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
          >
            <span className="text-sm">{capitalizeFirstLetter(subcategory.name)}</span>
            {subcategory.subcategories && subcategory.subcategories.length > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}