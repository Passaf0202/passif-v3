
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
      const container = containerRef.current;
      if (!container) return;

      const updateVisibleCategories = () => {
        const containerWidth = container.offsetWidth;
        let currentWidth = 0;
        const tempVisible: Category[] = [];
        
        // Paramètres d'espacement optimisés
        const buttonPadding = 16;
        const dotSpacing = 4;
        const charWidth = 6;
        const reservedSpace = 70;

        for (const category of categories) {
          const textWidth = category.name.length * charWidth;
          const totalWidth = textWidth + buttonPadding + dotSpacing;

          if (currentWidth + totalWidth < containerWidth - reservedSpace) {
            currentWidth += totalWidth;
            tempVisible.push(category);
          } else {
            break;
          }
        }

        // Vérifier si les catégories visibles ont réellement changé
        const hasChanged = tempVisible.length !== visibleCategories.length ||
          tempVisible.some((cat, index) => visibleCategories[index]?.id !== cat.id);

        if (hasChanged) {
          setVisibleCategories(tempVisible);
        }
      };

      // Appel initial
      updateVisibleCategories();

      // Gestionnaire de redimensionnement optimisé avec debounce
      let resizeTimeout: number;
      const handleResize = () => {
        if (resizeTimeout) {
          window.clearTimeout(resizeTimeout);
        }
        resizeTimeout = window.setTimeout(updateVisibleCategories, 100);
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeTimeout) {
          window.clearTimeout(resizeTimeout);
        }
      };
    } else {
      setVisibleCategories(categories || []);
    }
  }, [categories, isMobile]); // Retiré containerRef des dépendances

  return visibleCategories;
}
