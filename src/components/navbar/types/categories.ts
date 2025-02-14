
import { Category } from "@/types/category";

export interface CategoryHighlight {
  brands: string[];
  sections: string[];
  types: string[];
  services: string[];
}

export interface MenuState {
  isOpen: boolean;
  currentCategory: string | null;
  isTransitioning: boolean;
}

export interface NavbarCategoriesProps {
  categories: Category[];
  isMobile?: boolean;
}
