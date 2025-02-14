
import { useState, useRef, useEffect } from 'react';
import { MenuState } from '../types/categories';
import { TIMING } from '../constants/categoryHighlights';

export function useMenuState() {
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    currentCategory: null,
    isTransitioning: false
  });
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

  const handleCategoryEnter = (categoryId: string) => {
    setMenuState(prev => ({
      isOpen: true,
      currentCategory: categoryId,
      isTransitioning: prev.currentCategory !== null && prev.currentCategory !== categoryId
    }));
  };

  const handleMenuZoneEnter = () => {
    // Rien à faire quand on entre dans la zone du menu
  };

  const handleMenuZoneLeave = () => {
    closeMenu();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeMenu();
    }
  };

  const closeMenu = () => {
    setMenuState({
      isOpen: false,
      currentCategory: null,
      isTransitioning: false
    });
  };

  return {
    menuState,
    menuRef,
    menuZoneRef,
    handleCategoryEnter,
    handleMenuZoneEnter,
    handleMenuZoneLeave,
    handleBackdropClick,
    closeMenu
  };
}
