
import { useState, useRef, useEffect } from 'react';
import { MenuState } from '../types/categories';
import { TIMING, MENU_ZONES } from '../constants/categoryHighlights';

export function useMenuState() {
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    currentCategory: null,
    isTransitioning: false
  });
  const [closeTimeout, setCloseTimeout] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuState.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuState.isOpen]);

  const clearTimeouts = () => {
    if (closeTimeout) {
      window.clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
  };

  const handleCategoryEnter = (categoryId: string) => {
    clearTimeouts();
    
    setMenuState(prev => ({
      isOpen: true,
      currentCategory: categoryId,
      isTransitioning: prev.currentCategory !== null && prev.currentCategory !== categoryId
    }));
  };

  const handleMenuZoneEnter = () => {
    clearTimeouts();
  };

  const handleMenuZoneLeave = (e: React.MouseEvent) => {
    const menuRect = menuZoneRef.current?.getBoundingClientRect();
    if (!menuRect) return;

    const { clientX, clientY } = e;

    // Définition des trois zones distinctes
    const zones = {
      // Zone active du menu (contenu réel)
      activeMenuZone: {
        isInside: 
          clientX >= menuRect.left && 
          clientX <= menuRect.right && 
          clientY >= MENU_ZONES.safeZone.top && 
          clientY <= menuRect.bottom
      },
      
      // Zone des catégories (barre du haut)
      categoryZone: {
        isInside: 
          clientY > MENU_ZONES.safeZone.top - MENU_ZONES.categories.buffer && 
          clientY < MENU_ZONES.safeZone.top + MENU_ZONES.categories.height
      },
      
      // Zone de transition (petite marge autour du menu)
      transitionZone: {
        isInside: 
          clientX >= menuRect.left - 20 && 
          clientX <= menuRect.right + 20 && 
          clientY >= MENU_ZONES.safeZone.top - 10 && 
          clientY <= menuRect.bottom + 10
      }
    };

    if (zones.activeMenuZone.isInside || zones.categoryZone.isInside) {
      // Si on est dans la zone active du menu ou la zone des catégories
      clearTimeouts();
    } else if (zones.transitionZone.isInside) {
      // Si on est dans la zone de transition, on programme la fermeture
      scheduleClose();
    } else {
      // Si on est complètement en dehors, fermeture immédiate
      closeMenu();
    }
  };

  const scheduleClose = () => {
    clearTimeouts();
    
    const closeTimer = window.setTimeout(() => {
      setMenuState({
        isOpen: false,
        currentCategory: null,
        isTransitioning: false
      });
    }, TIMING.closeDelay);

    setCloseTimeout(closeTimer);
  };

  const closeMenu = () => {
    clearTimeouts();
    setMenuState({
      isOpen: false,
      currentCategory: null,
      isTransitioning: false
    });
  };

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [closeTimeout]);

  return {
    menuState,
    menuRef,
    menuZoneRef,
    handleCategoryEnter,
    handleMenuZoneEnter,
    handleMenuZoneLeave
  };
}
