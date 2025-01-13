import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Category } from "@/types/category";

interface DesktopCategoryItemProps {
  category: Category;
  handleCategoryClick: (categoryName: string) => void;
  formatCategoryName: (name: string) => string;
}

export const DesktopCategoryItem = ({
  category,
  handleCategoryClick,
  formatCategoryName,
}: DesktopCategoryItemProps) => {
  return (
    <div className="group relative">
      <button
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors whitespace-nowrap px-3 py-1.5 rounded-md hover:bg-gray-50"
        onClick={() => handleCategoryClick(category.name)}
      >
        {formatCategoryName(category.name)}
        <ChevronDown className="h-4 w-4" />
      </button>

      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-[calc(100%+4px)] w-64 bg-white border rounded-md shadow-lg z-[200]">
        <div className="py-2">
          <Link
            to={`/category/${category.name.toLowerCase()}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Tout {formatCategoryName(category.name)}
          </Link>
          {category.subcategories?.map((subcategory) => (
            <Link
              key={subcategory.id}
              to={`/category/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}`}
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              {formatCategoryName(subcategory.name)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};