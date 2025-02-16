
import { Category } from "@/types/category";

// Même ordre de priorité que dans useOrganizedCategories
const PRIORITY_CATEGORIES = [
  "vehicles",
  "real estate",
  "electronics",
  "fashion",
  "collectibles",
  "art",
  "sports",
  "music"
];

export function useMobileCategories(categories: Category[] | undefined) {
  if (!categories) return [];
  
  // Trier selon l'ordre de PRIORITY_CATEGORIES d'abord
  const orderedCategories = [
    ...PRIORITY_CATEGORIES
      .map(name => categories.find(cat => cat.name.toLowerCase() === name))
      .filter((cat): cat is Category => cat !== undefined),
    // Puis ajouter les autres catégories
    ...categories.filter(cat => !PRIORITY_CATEGORIES.includes(cat.name.toLowerCase()))
  ];
  
  return orderedCategories;
}
