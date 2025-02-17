
import { useState, useEffect, RefObject } from "react";

export function useAdaptiveLayout(
  containerRef: RefObject<HTMLDivElement>,
  categoriesRef: RefObject<HTMLDivElement>
) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !categoriesRef.current) return;

    const checkLayout = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const categoriesWidth = categoriesRef.current?.scrollWidth || 0;
      const categoriesVisible = categoriesRef.current?.offsetWidth || 0;

      // Si les catégories sont plus larges que leur conteneur visible ou
      // si la largeur du conteneur est trop petite pour un affichage confortable
      const shouldBeMobile = categoriesWidth > categoriesVisible || containerWidth < 900;
      
      if (shouldBeMobile !== isMobile) {
        setIsMobile(shouldBeMobile);
      }
    };

    const resizeObserver = new ResizeObserver(checkLayout);
    resizeObserver.observe(containerRef.current);
    resizeObserver.observe(categoriesRef.current);

    // Vérification initiale
    checkLayout();

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, categoriesRef, isMobile]);

  return isMobile;
}
