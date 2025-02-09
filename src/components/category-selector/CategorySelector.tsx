import { useState, useEffect } from "react";
import { CategorySelect } from "./CategorySelect";
import { useCategoryData } from "./useCategoryData";

interface CategorySelectorProps {
  onCategoryChange: (category: string, subcategory?: string, subsubcategory?: string) => void;
}

export function CategorySelector({ onCategoryChange }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedSubsubcategory, setSelectedSubsubcategory] = useState<string>("");

  const {
    categories,
    subcategories,
    subsubcategories,
    fetchSubcategories,
    fetchSubsubcategories,
  } = useCategoryData();

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubcategory) {
      fetchSubsubcategories(selectedSubcategory);
    }
  }, [selectedSubcategory]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const category = categories.find(c => c.id === value);
    onCategoryChange(category?.name || "");
    setSelectedSubcategory("");
    setSelectedSubsubcategory("");
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
    const subcategory = subcategories.find(c => c.id === value);
    onCategoryChange(
      categories.find(c => c.id === selectedCategory)?.name || "",
      subcategory?.name
    );
    setSelectedSubsubcategory("");
  };

  const handleSubsubcategoryChange = (value: string) => {
    setSelectedSubsubcategory(value);
    const subsubcategory = subsubcategories.find(c => c.id === value);
    onCategoryChange(
      categories.find(c => c.id === selectedCategory)?.name || "",
      subcategories.find(c => c.id === selectedSubcategory)?.name,
      subsubcategory?.name
    );
  };

  return (
    <div className="space-y-4">
      <CategorySelect
        label="Catégorie"
        value={selectedCategory}
        placeholder="Sélectionnez une catégorie"
        categories={categories}
        onChange={handleCategoryChange}
      />

      {selectedCategory && subcategories.length > 0 && (
        <CategorySelect
          label="Sous-catégorie"
          value={selectedSubcategory}
          placeholder="Sélectionnez une sous-catégorie"
          categories={subcategories}
          onChange={handleSubcategoryChange}
        />
      )}

      {selectedSubcategory && subsubcategories.length > 0 && (
        <CategorySelect
          label="Sous-sous-catégorie"
          value={selectedSubsubcategory}
          placeholder="Sélectionnez une sous-sous-catégorie"
          categories={subsubcategories}
          onChange={handleSubsubcategoryChange}
        />
      )}
    </div>
  );
}