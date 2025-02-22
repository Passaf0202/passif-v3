
import { useState, useEffect, RefObject, useCallback } from "react";
import { Category } from "@/types/category";

export function useVisibleCategories(
  categories: Category[] | undefined,
  isMobile: boolean,
  containerRef: RefObject<HTMLDivElement>
) {
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);
  const [previousWidth, setPreviousWidth] = useState<number>(0);

  const calculateVisibleCategories = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    
    // Skip calculation if width hasn't changed
    if (containerWidth === previousWidth) return;
    setPreviousWidth(containerWidth);

    let currentWidth = 0;
    const tempVisible: Category[] = [];
    
    // Paramètres d'espacement optimisés
    const buttonPadding = 16;
    const dotSpacing = 4;
    const charWidth = 6;
    const reservedSpace = 70;

    if (categories) {
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
    }

    setVisibleCategories(tempVisible);
  }, [categories, previousWidth]);

  useEffect(() => {
    if (!isMobile && categories) {
      // Initial calculation
      calculateVisibleCategories();

      // Debounced resize handler
      let timeoutId: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(calculateVisibleCategories, 100);
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
      };
    } else {
      setVisibleCategories(categories || []);
    }
  }, [isMobile, categories, calculateVisibleCategories]);

  return visibleCategories;
}
