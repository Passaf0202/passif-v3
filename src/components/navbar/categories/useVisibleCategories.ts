
import { useState, useEffect, RefObject } from "react";
import { Category } from "@/types/category";

export function useVisibleCategories(
  categories: Category[] | undefined,
  isMobile: boolean,
  containerRef: RefObject<HTMLDivElement>
) {
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!isMobile && categories) {
      const updateVisibleCategories = () => {
        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.offsetWidth;
        let currentWidth = 0;
        const tempVisible: Category[] = [];
        
        // Paramètres d'espacement optimisés
        const buttonPadding = 16; // 8px de chaque côté (px-2)
        const dotSpacing = 4; // 2px de chaque côté du point
        const charWidth = 6; // Largeur moyenne plus précise d'un caractère
        const reservedSpace = 70; // Espace réduit pour "Autres"

        for (const category of categories) {
          // Calculer la largeur estimée pour cette catégorie
          const textWidth = category.name.length * charWidth;
          const totalWidth = textWidth + buttonPadding + dotSpacing;

          if (currentWidth + totalWidth < containerWidth - reservedSpace) {
            currentWidth += totalWidth;
            tempVisible.push(category);
          } else {
            break;
          }
        }

        setVisibleCategories(tempVisible);
      };

      updateVisibleCategories();
      window.addEventListener('resize', updateVisibleCategories);
      
      return () => {
        window.removeEventListener('resize', updateVisibleCategories);
      };
    } else {
      setVisibleCategories(categories || []);
    }
  }, [categories, isMobile, containerRef]);

  return visibleCategories;
}
