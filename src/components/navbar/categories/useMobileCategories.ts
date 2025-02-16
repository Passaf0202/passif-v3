
import { Category } from "@/types/category";

// Définir l'ordre de priorité des catégories
const PRIORITY_CATEGORIES = [
  "Immobilier",
  "Véhicules",
  "Locations de vacances",
  "Emploi",
  "Électronique",
  "Mode",
  "Maison & Jardin",
  "Famille"
];

export function useMobileCategories(categories: Category[] | undefined) {
  if (!categories) return [];
  
  // Trier selon l'ordre de PRIORITY_CATEGORIES d'abord
  const orderedCategories = [
    ...PRIORITY_CATEGORIES
      .map(name => categories.find(cat => cat.name === name))
      .filter((cat): cat is Category => cat !== undefined),
    // Puis ajouter les autres catégories dans l'ordre alphabétique
    ...categories.filter(cat => !PRIORITY_CATEGORIES.includes(cat.name))
  ];
  
  return orderedCategories;
}
