
import { useState, useEffect, RefObject } from "react";

export function useAdaptiveLayout(
  containerRef: RefObject<HTMLDivElement>,
  categoriesRef?: RefObject<HTMLDivElement>
) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const checkLayout = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      
      // Si nous avons une ref pour les catégories, utilisons-la
      if (categoriesRef?.current) {
        const categoriesWidth = categoriesRef.current.scrollWidth || 0;
        const categoriesVisible = categoriesRef.current.offsetWidth || 0;
        const shouldBeMobile = categoriesWidth > categoriesVisible || containerWidth < 900;
        setIsMobile(shouldBeMobile);
      } else {
        // Sinon, basons-nous uniquement sur la largeur du conteneur
        setIsMobile(containerWidth < 900);
      }
    };

    const resizeObserver = new ResizeObserver(checkLayout);
    resizeObserver.observe(containerRef.current);
    
    if (categoriesRef?.current) {
      resizeObserver.observe(categoriesRef.current);
    }

    // Vérification initiale
    checkLayout();

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, categoriesRef]);

  return isMobile;
}
