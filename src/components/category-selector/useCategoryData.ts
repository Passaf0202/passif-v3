import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";

export function useCategoryData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [subsubcategories, setSubsubcategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("level", 1);

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    setCategories(data || []);
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

    setSubcategories(data || []);
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

    setSubsubcategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    subcategories,
    subsubcategories,
    fetchSubcategories,
    fetchSubsubcategories,
  };
}