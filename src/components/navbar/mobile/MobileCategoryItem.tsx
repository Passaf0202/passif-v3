import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Category } from "@/types/category";

interface MobileCategoryItemProps {
  category: Category;
  openCategory: string | null;
  handleCategoryClick: (categoryName: string) => void;
  formatCategoryName: (name: string) => string;
}

export const MobileCategoryItem = ({
  category,
  openCategory,
  handleCategoryClick,
  formatCategoryName,
}: MobileCategoryItemProps) => {
  return (
    <>
      <button
        onClick={() => handleCategoryClick(category.name)}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
      >
        {formatCategoryName(category.name)}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            openCategory === category.name ? "rotate-180" : ""
          }`}
        />
      </button>

      {openCategory === category.name && (
        <div className="fixed inset-x-0 top-[8.5rem] bg-white border-t border-b z-50">
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
      )}
    </>
  );
};