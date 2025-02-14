
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
    // Utiliser menuRef pour obtenir les dimensions exactes du menu actif
    const menuElement = menuRef.current;
    if (!menuElement) return;

    const menuRect = menuElement.getBoundingClientRect();
    const { clientX, clientY } = e;

    // Définir les zones de manière plus précise
    const isCategoryBarZone = 
      clientX >= menuRect.left && 
      clientX <= menuRect.right && 
      clientY >= MENU_ZONES.safeZone.top - MENU_ZONES.categories.buffer && 
      clientY <= MENU_ZONES.safeZone.top + MENU_ZONES.categories.height;

    const isMenuContentZone = 
      clientX >= menuRect.left && 
      clientX <= menuRect.right && 
      clientY >= menuRect.top && 
      clientY <= menuRect.bottom;

    // Si on est dans l'une des zones actives, on reste ouvert
    if (isCategoryBarZone || isMenuContentZone) {
      clearTimeouts();
    } else {
      // Sinon, on programme la fermeture progressive
      scheduleClose();
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
    handleMenuZoneLeave,
    closeMenu
  };
}
