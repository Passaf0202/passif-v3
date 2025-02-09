
import { useEffect, useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  level: number;
  icon: string | null;
}

interface CategorySelectorProps {
  onCategoryChange: (category: string, subcategory?: string, subsubcategory?: string) => void;
}

export function CategorySelector({ onCategoryChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [subsubcategories, setSubsubcategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedSubsubcategory, setSelectedSubsubcategory] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("level", 1);

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    console.log("Fetched categories:", data);
    setCategories(data?.filter(category => category.id && category.name) || []);
  };

  const fetchSubcategories = async (parentId: string) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("parent_id", parentId);

    if (error) {
      console.error("Error fetching subcategories:", error);
      return;
    }

    console.log("Fetched subcategories:", data);
    setSubcategories(data?.filter(category => category.id && category.name) || []);
    setSelectedSubcategory("");
    setSubsubcategories([]);
    setSelectedSubsubcategory("");
  };

  const fetchSubsubcategories = async (parentId: string) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("parent_id", parentId);

    if (error) {
      console.error("Error fetching subsubcategories:", error);
      return;
    }

    console.log("Fetched subsubcategories:", data);
    setSubsubcategories(data?.filter(category => category.id && category.name) || []);
    setSelectedSubsubcategory("");
  };

  const handleCategoryChange = (value: string) => {
    if (!value) return;
    setSelectedCategory(value);
    const category = categories.find(c => c.id === value);
    onCategoryChange(category?.name || "Catégorie non spécifiée");
  };

  const handleSubcategoryChange = (value: string) => {
    if (!value) return;
    setSelectedSubcategory(value);
    const subcategory = subcategories.find(c => c.id === value);
    onCategoryChange(
      categories.find(c => c.id === selectedCategory)?.name || "Catégorie non spécifiée",
      subcategory?.name
    );
  };

  const handleSubsubcategoryChange = (value: string) => {
    if (!value) return;
    setSelectedSubsubcategory(value);
    const subsubcategory = subsubcategories.find(c => c.id === value);
    onCategoryChange(
      categories.find(c => c.id === selectedCategory)?.name || "Catégorie non spécifiée",
      subcategories.find(c => c.id === selectedSubcategory)?.name,
      subsubcategory?.name
    );
  };

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Catégorie</FormLabel>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {categories.map((category) => (
              category.id && category.name ? (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ) : null
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      {selectedCategory && subcategories.length > 0 && (
        <FormItem>
          <FormLabel>Sous-catégorie</FormLabel>
          <Select value={selectedSubcategory} onValueChange={handleSubcategoryChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une sous-catégorie" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {subcategories.map((subcategory) => (
                subcategory.id && subcategory.name ? (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ) : null
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}

      {selectedSubcategory && subsubcategories.length > 0 && (
        <FormItem>
          <FormLabel>Sous-sous-catégorie</FormLabel>
          <Select value={selectedSubsubcategory} onValueChange={handleSubsubcategoryChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une sous-sous-catégorie" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {subsubcategories.map((subsubcategory) => (
                subsubcategory.id && subsubcategory.name ? (
                  <SelectItem key={subsubcategory.id} value={subsubcategory.id}>
                    {subsubcategory.name}
                  </SelectItem>
                ) : null
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    </div>
  );
}
