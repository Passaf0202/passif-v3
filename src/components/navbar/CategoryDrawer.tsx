import { Menu, ChevronRight, List, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Category } from "@/types/category";
import { Link } from "react-router-dom";
import { getCategoryIcon } from "@/utils/categoryIcons";

interface CategoryDrawerProps {
  categories: Category[];
}

// Helper function to capitalize first letter only
const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function CategoryDrawer({ categories }: CategoryDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);

  const handleCategoryClick = (category: Category) => {
    console.log("Selected category:", category.name);
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryClick = (subcategory: Category) => {
    console.log("Selected subcategory:", subcategory.name);
    setSelectedSubcategory(subcategory);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="h-full flex flex-col">
          {/* Main Categories View */}
          {!selectedCategory && (
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 mb-6">
                <List className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Catégories</h2>
              </div>
              <div className="grid gap-2">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm">{capitalizeFirstLetter(category.name)}</span>
                      </div>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subcategories View */}
          {selectedCategory && !selectedSubcategory && (
            <div className="p-4 space-y-2">
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 text-sm text-primary mb-6 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux catégories
              </button>
              <div className="flex items-center gap-2 mb-6">
                {getCategoryIcon(selectedCategory.name)({ className: "h-5 w-5 text-primary" })}
                <h2 className="text-lg font-semibold">{capitalizeFirstLetter(selectedCategory.name)}</h2>
              </div>
              <Link
                to={`/category/${selectedCategory.name.toLowerCase()}`}
                className="block w-full text-left p-3 text-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                Voir tout
              </Link>
              <div className="grid gap-2 mt-4">
                {selectedCategory.subcategories?.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(subcategory)}
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
          )}

          {/* Sub-subcategories View */}
          {selectedSubcategory && (
            <div className="p-4 space-y-2">
              <button
                onClick={handleBackToSubcategories}
                className="flex items-center gap-2 text-sm text-primary mb-6 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à {capitalizeFirstLetter(selectedCategory?.name || '')}
              </button>
              <h2 className="text-lg font-semibold mb-6">{capitalizeFirstLetter(selectedSubcategory.name)}</h2>
              <Link
                to={`/category/${selectedCategory?.name.toLowerCase()}/${selectedSubcategory.name.toLowerCase()}`}
                className="block w-full text-left p-3 text-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                Voir tout
              </Link>
              <div className="grid gap-2 mt-4">
                {selectedSubcategory.subcategories?.map((subsubcategory) => (
                  <Link
                    key={subsubcategory.id}
                    to={`/category/${selectedCategory?.name.toLowerCase()}/${selectedSubcategory.name.toLowerCase()}/${subsubcategory.name.toLowerCase()}`}
                    className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-sm">{capitalizeFirstLetter(subsubcategory.name)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}