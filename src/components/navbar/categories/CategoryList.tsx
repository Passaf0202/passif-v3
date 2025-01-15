import { Category } from "@/types/category";
import { ChevronRight } from "lucide-react";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { capitalizeFirstLetter } from "../../../utils/textUtils";

interface CategoryListProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
}

export function CategoryList({ categories, onCategoryClick }: CategoryListProps) {
  return (
    <div className="grid gap-2">
      {categories.map((category) => {
        const IconComponent = getCategoryIcon(category.name);
        return (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <IconComponent className="h-5 w-5 text-primary" />
              <span className="text-sm">{capitalizeFirstLetter(category.name)}</span>
            </div>
            {category.subcategories && category.subcategories.length > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
            )}
          </button>
        );
      })}
    </div>
  );
}