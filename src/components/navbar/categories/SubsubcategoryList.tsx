import { Category } from "@/types/category";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../utils/textUtils";

interface SubsubcategoryListProps {
  category: Category;
  subcategory: Category;
  onBackClick: () => void;
}

export function SubsubcategoryList({ 
  category, 
  subcategory, 
  onBackClick 
}: SubsubcategoryListProps) {
  return (
    <div className="p-4 space-y-2">
      <button
        onClick={onBackClick}
        className="flex items-center gap-2 text-sm text-primary mb-6 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à {capitalizeFirstLetter(category.name)}
      </button>
      <h2 className="text-lg font-semibold mb-6">
        {capitalizeFirstLetter(subcategory.name)}
      </h2>
      <Link
        to={`/category/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}`}
        className="block w-full text-left p-3 text-primary hover:bg-gray-100 rounded-lg transition-colors"
      >
        Voir tout
      </Link>
      <div className="grid gap-2 mt-4">
        {subcategory.subcategories?.map((subsubcategory) => (
          <Link
            key={subsubcategory.id}
            to={`/category/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}/${subsubcategory.name.toLowerCase()}`}
            className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-sm">
              {capitalizeFirstLetter(subsubcategory.name)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}