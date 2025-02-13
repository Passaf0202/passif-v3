
import { Category } from "@/types/category";

const PRIORITY_CATEGORIES = [
  "Immobilier",
  "Véhicules",
  "Locations de vacances",
  "Emploi",
  "Mode",
  "Maison & Jardin",
  "Famille",
  "Électronique",
  "Loisirs"
];

export function useOrganizedCategories(categories: Category[] | undefined) {
  if (!categories) return [];

  const priorityCategories = PRIORITY_CATEGORIES
    .map(name => categories.find(cat => cat.name === name))
    .filter((cat): cat is Category => cat !== undefined);

  const otherCategories = categories.filter(
    cat => !PRIORITY_CATEGORIES.includes(cat.name)
  );

  if (otherCategories.length > 0) {
    const othersCategory: Category = {
      id: "others",
      name: "Autres",
      subcategories: otherCategories
    };
    return [...priorityCategories, othersCategory];
  }

  return priorityCategories;
}
