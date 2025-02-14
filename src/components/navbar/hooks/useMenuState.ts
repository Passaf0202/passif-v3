
import { useState, useRef, useEffect } from 'react';
import { MenuState } from '../types/categories';
import { TIMING } from '../constants/categoryHighlights';

export function useMenuState() {
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    currentCategory: null,
    isTransitioning: false
  });
  const [closeTimeout, setCloseTimeout] = useState<number | null>(null);
  const [openTimeout, setOpenTimeout] = useState<number | null>(null);
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
    if (openTimeout) {
      window.clearTimeout(openTimeout);
      setOpenTimeout(null);
    }
  };

  const handleCategoryEnter = (categoryId: string) => {
    clearTimeouts();

    const openTimer = window.setTimeout(() => {
      setMenuState(prev => ({
        isOpen: true,
        currentCategory: categoryId,
        isTransitioning: prev.currentCategory !== null && prev.currentCategory !== categoryId
      }));
    }, menuState.isOpen ? 0 : TIMING.openDelay);

    setOpenTimeout(openTimer);
  };

  const handleMenuZoneEnter = () => {
    clearTimeouts();
  };

  const handleMenuZoneLeave = (e: React.MouseEvent) => {
    const menuRect = menuZoneRef.current?.getBoundingClientRect();
    if (!menuRect) return;

    const mouseY = e.clientY;
    const mouseX = e.clientX;

    if (mouseY < menuRect.top || mouseX < menuRect.left - 50 || mouseX > menuRect.right + 50) {
      closeMenu();
    } else {
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
      if (closeTimeout) {
        window.clearTimeout(closeTimeout);
      }
      if (openTimeout) {
        window.clearTimeout(openTimeout);
      }
    };
  }, [closeTimeout, openTimeout]);

  return {
    menuState,
    menuRef,
    menuZoneRef,
    handleCategoryEnter,
    handleMenuZoneEnter,
    handleMenuZoneLeave
  };
}
