import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Suggestion } from "./types";

export const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 1) {
        setSuggestions([]);
        return;
      }

      // Get recent searches
      const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]")
        .map((search: any) => ({
          id: search.timestamp,
          title: search.query,
          isRecent: true
        }))
        .filter((search: Suggestion) => 
          search.title.toLowerCase().includes(query.toLowerCase())
        );

      // Fetch category attributes for brand suggestions
      const { data: attributes } = await supabase
        .from("category_attributes")
        .select("*")
        .or(`attribute_value.ilike.%${query}%`);

      // Create brand suggestions
      const brandSuggestions = (attributes || []).map(attr => ({
        id: `smart-brand-${attr.id}`,
        title: attr.attribute_value,
        category: attr.attribute_type.includes('car') ? 'Voitures' : 
                 attr.attribute_type.includes('moto') ? 'Motos' : 'Autres'
      }));

      // Fetch real listings for suggestions
      const { data: listings } = await supabase
        .from("listings")
        .select("id, title, category")
        .ilike("title", `%${query}%`)
        .eq("status", "active")
        .limit(3);

      // Add smart suggestions based on common patterns
      const smartSuggestions = [
        {
          id: "smart-1",
          title: `${query} occasion`,
          category: "Toutes catégories"
        },
        {
          id: "smart-2",
          title: `${query} pas cher`,
          category: "Toutes catégories"
        }
      ];

      const allSuggestions = [
        ...recentSearches,
        ...brandSuggestions,
        ...(listings || []).map(l => ({
          id: l.id,
          title: l.title,
          category: l.category
        })),
        ...smartSuggestions
      ];

      setSuggestions(allSuggestions.slice(0, 8));
    };

    fetchSuggestions();
  }, [query]);

  return suggestions;
};