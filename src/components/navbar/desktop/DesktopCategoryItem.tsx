import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Category } from "@/types/category";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors whitespace-nowrap px-3 py-1.5 rounded-md hover:bg-gray-50 ${
          isOpen ? "bg-gray-50" : ""
        }`}
        onClick={() => {
          handleCategoryClick(category.name);
          setIsOpen(!isOpen);
        }}
      >
        {formatCategoryName(category.name)}
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>

      {isOpen && category.subcategories && category.subcategories.length > 0 && (
        <div className="absolute left-0 top-full pt-2 w-64 z-[9999]">
          <div className="bg-white border rounded-md shadow-lg py-2">
            <Link
              to={`/category/${category.name.toLowerCase()}`}
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Tout {formatCategoryName(category.name)}
            </Link>
            {category.subcategories.map((subcategory) => (
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
    </div>
  );
};