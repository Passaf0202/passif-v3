import { useEffect, useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
  const [isLoading, setIsLoading] = useState(true);

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
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1);

      if (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetched categories:", data);
      setCategories(data?.filter(cat => cat.id && cat.name) || []);
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des catégories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubcategories = async (parentId: string) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", parentId);

      if (error) {
        console.error("Error fetching subcategories:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les sous-catégories",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetched subcategories:", data);
      setSubcategories(data?.filter(cat => cat.id && cat.name) || []);
      setSelectedSubcategory("");
      setSubsubcategories([]);
      setSelectedSubsubcategory("");
    } catch (error) {
      console.error("Error in fetchSubcategories:", error);
    }
  };

  const fetchSubsubcategories = async (parentId: string) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", parentId);

      if (error) {
        console.error("Error fetching subsubcategories:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les sous-sous-catégories",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetched subsubcategories:", data);
      setSubsubcategories(data?.filter(cat => cat.id && cat.name) || []);
      setSelectedSubsubcategory("");
    } catch (error) {
      console.error("Error in fetchSubsubcategories:", error);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (!value) return;
    setSelectedCategory(value);
    const category = categories.find(c => c.id === value);
    if (category) {
      onCategoryChange(category.name);
    }
  };

  const handleSubcategoryChange = (value: string) => {
    if (!value) return;
    setSelectedSubcategory(value);
    const subcategory = subcategories.find(c => c.id === value);
    const category = categories.find(c => c.id === selectedCategory);
    if (category && subcategory) {
      onCategoryChange(category.name, subcategory.name);
    }
  };

  const handleSubsubcategoryChange = (value: string) => {
    if (!value) return;
    setSelectedSubsubcategory(value);
    const subsubcategory = subsubcategories.find(c => c.id === value);
    const category = categories.find(c => c.id === selectedCategory);
    const subcategory = subcategories.find(c => c.id === selectedSubcategory);
    if (category && subcategory && subsubcategory) {
      onCategoryChange(category.name, subcategory.name, subsubcategory.name);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <FormItem>
          <FormLabel>Catégorie</FormLabel>
          <Select disabled>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Chargement des catégories..." />
              </SelectTrigger>
            </FormControl>
          </Select>
        </FormItem>
      </div>
    );
  }

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
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
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
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
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
                <SelectItem key={subsubcategory.id} value={subsubcategory.id}>
                  {subsubcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    </div>
  );
}