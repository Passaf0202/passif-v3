import { Menu, List } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Category } from "@/types/category";
import { CategoryList } from "./categories/CategoryList";
import { SubcategoryList } from "./categories/SubcategoryList";
import { SubsubcategoryList } from "./categories/SubsubcategoryList";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryDrawerProps {
  categories: Category[];
}

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
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {!selectedCategory && (
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 mb-6">
                  <List className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Catégories</h2>
                </div>
                <CategoryList 
                  categories={categories} 
                  onCategoryClick={handleCategoryClick} 
                />
              </div>
            )}

            {selectedCategory && !selectedSubcategory && (
              <SubcategoryList
                category={selectedCategory}
                onBackClick={handleBackToCategories}
                onSubcategoryClick={handleSubcategoryClick}
              />
            )}

            {selectedCategory && selectedSubcategory && (
              <SubsubcategoryList
                category={selectedCategory}
                subcategory={selectedSubcategory}
                onBackClick={handleBackToSubcategories}
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}