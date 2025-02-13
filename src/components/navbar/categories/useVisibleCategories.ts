
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
        const minSpacing = 16; // Espacement minimum entre les éléments
        const dotWidth = 16; // Largeur approximative du point
        const buttonPadding = 16; // Padding total horizontal des boutons

        // Garder de l'espace pour le bouton "Autres" si nécessaire
        const reservedSpace = 80;

        categories.forEach((category, index) => {
          // Calculer la largeur estimée de cet élément
          const textWidth = category.name.length * 7; // Approximation de la largeur du texte
          const elementWidth = textWidth + buttonPadding;
          const withDotWidth = elementWidth + (index < categories.length - 1 ? dotWidth + minSpacing : 0);

          if (currentWidth + withDotWidth < containerWidth - reservedSpace) {
            currentWidth += withDotWidth;
            tempVisible.push(category);
          } else {
            return; // Sortir de la boucle une fois qu'on dépasse la largeur disponible
          }
        });

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
