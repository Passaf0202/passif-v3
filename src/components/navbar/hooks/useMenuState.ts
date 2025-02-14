
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
    
    // Zone de sécurité calculée à partir du bas de la navbar
    const isInSafeZone = 
      clientY < MENU_ZONES.safeZone.top || // Au-dessus de la navbar
      clientY > menuRect.bottom + MENU_ZONES.safeZone.bottom || // Large zone en bas
      clientX < menuRect.left - MENU_ZONES.safeZone.sides ||
      clientX > menuRect.right + MENU_ZONES.safeZone.sides;

    // Zone des catégories inclut maintenant une zone tampon plus grande
    const isCategoryZone = 
      clientY > MENU_ZONES.safeZone.top && 
      clientY < MENU_ZONES.safeZone.top + MENU_ZONES.categories.height + MENU_ZONES.categories.buffer;

    if (isInSafeZone) {
      closeMenu();
    } else if (!isCategoryZone) {
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
    handleMenuZoneLeave
  };
}
