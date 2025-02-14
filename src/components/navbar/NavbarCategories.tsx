
import { Category } from "@/types/category";
import { useState, useRef, useEffect } from "react";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { Link } from "react-router-dom";
import { useOrganizedCategories } from "./categories/useOrganizedCategories";
import { useVisibleCategories } from "./categories/useVisibleCategories";
import { ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavbarCategoriesProps {
  categories: Category[];
  isMobile?: boolean;
}

interface CategoryHighlight {
  brands: string[];
  sections: string[];
  types: string[];
  services: string[];
}

interface MenuState {
  isOpen: boolean;
  currentCategory: string | null;
  isTransitioning: boolean;
}

const CATEGORY_HIGHLIGHTS: Record<string, CategoryHighlight> = {
  "Véhicules": {
    brands: ["Peugeot", "Renault", "Volkswagen", "BMW", "Mercedes", "Audi"],
    sections: ["Voitures", "Motos", "Caravaning", "Utilitaires"],
    types: [],
    services: []
  },
  "Mode": {
    brands: [],
    sections: ["Vêtements", "Chaussures", "Accessoires", "Montres & Bijoux"],
    types: ["Femme", "Homme", "Enfant"],
    services: []
  },
  "Immobilier": {
    brands: [],
    sections: [],
    types: ["Vente", "Location", "Colocation", "Bureaux & Commerces"],
    services: ["Évaluation immobilière", "Diagnostic"]
  }
};

const TIMING = {
  closeDelay: 400,    // Délai plus long avant la fermeture
  openDelay: 50,      // Petit délai à l'ouverture
  transitionDelay: 50 // Délai pour le changement de catégorie
};

export function NavbarCategories({
  categories,
  isMobile
}: NavbarCategoriesProps) {
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    currentCategory: null,
    isTransitioning: false
  });
  const [closeTimeout, setCloseTimeout] = useState<number | null>(null);
  const [openTimeout, setOpenTimeout] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuZoneRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const organizedCategories = useOrganizedCategories(categories);
  const visibleCategories = useVisibleCategories(organizedCategories, !!isMobile, containerRef);

  const hiddenCategories = organizedCategories.filter(
    cat => !visibleCategories.find(visible => visible.id === cat.id)
  );

  const othersCategory = hiddenCategories.length > 0 ? {
    id: "others",
    name: "Autres",
    subcategories: hiddenCategories
  } : null;

  const displayedCategories = othersCategory 
    ? [...visibleCategories, othersCategory]
    : visibleCategories;

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

    // Si la souris sort par le haut ou les côtés, on ferme immédiatement
    if (mouseY < menuRect.top || mouseX < menuRect.left - 50 || mouseX > menuRect.right + 50) {
      closeMenu();
    } else {
      // Sinon, on utilise le délai normal
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

  const renderCategoryContent = (category: Category) => {
    const highlights = CATEGORY_HIGHLIGHTS[category.name] || {
      brands: [],
      sections: [],
      types: [],
      services: []
    };
    const IconComponent = getCategoryIcon(category.name);

    return (
      <div className="h-full overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
          <div className="flex">
            {/* Colonne de gauche - Aperçu */}
            <div className="w-[250px] flex-shrink-0 pr-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <IconComponent className="h-6 w-6" />
                  <h3 className="text-lg font-medium">
                    {category.name}
                  </h3>
                </div>
                <Link 
                  to={`/category/${category.name.toLowerCase()}`}
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Voir tout {category.name.toLowerCase()}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
                
                {highlights.services.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Services associés</h4>
                    <ul className="space-y-2">
                      {highlights.services.map(service => (
                        <li key={service}>
                          <Link 
                            to={`/category/${category.name.toLowerCase()}/${service.toLowerCase()}`}
                            className="text-sm text-gray-600 hover:text-primary hover:underline"
                          >
                            {service}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Séparateur vertical */}
            <div className="w-px bg-gray-200 mx-4" />

            {/* Colonne de droite - Sous-catégories */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(90vh-120px)] pr-4">
                <div className="grid grid-cols-3 gap-8">
                  {/* Marques populaires si disponibles */}
                  {highlights.brands.length > 0 && (
                    <div className="col-span-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Marques populaires</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {highlights.brands.map(brand => (
                          <Link
                            key={brand}
                            to={`/category/${category.name.toLowerCase()}/marque/${brand.toLowerCase()}`}
                            className="text-sm text-gray-600 hover:text-primary hover:underline"
                          >
                            {brand}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sections principales */}
                  {category.subcategories?.map(subcat => (
                    <div key={subcat.id}>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">{subcat.name}</h4>
                      <ul className="space-y-2">
                        {subcat.subcategories?.map(subsub => (
                          <li key={subsub.id}>
                            <Link
                              to={`/category/${category.name.toLowerCase()}/${subcat.name.toLowerCase()}/${subsub.name.toLowerCase()}`}
                              className="text-sm text-gray-600 hover:text-primary hover:underline"
                            >
                              {subsub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Types spécifiques si disponibles */}
                  {highlights.types.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Types</h4>
                      <ul className="space-y-2">
                        {highlights.types.map(type => (
                          <li key={type}>
                            <Link
                              to={`/category/${category.name.toLowerCase()}/type/${type.toLowerCase()}`}
                              className="text-sm text-gray-600 hover:text-primary hover:underline"
                            >
                              {type}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return null;
  }

  return (
    <nav className="relative w-full border-b border-gray-200/80">
      <div className="max-w-[1440px] h-12 mx-auto px-4 md:px-8">
        <div className="h-full flex items-center justify-center" ref={containerRef}>
          <ul className="inline-flex items-center gap-1">
            {displayedCategories.map((category, index) => (
              <li 
                key={category.id} 
                ref={el => categoryRefs.current[category.id] = el}
                className={`relative flex items-center text-[13px] ${
                  menuState.currentCategory === category.id 
                    ? 'text-primary' 
                    : 'text-gray-700'
                }`}
                onMouseEnter={() => handleCategoryEnter(category.id)}
              >
                <button 
                  className={`px-3 py-2 hover:text-primary transition-colors whitespace-nowrap ${
                    menuState.currentCategory === category.id ? 'font-medium' : ''
                  }`}
                >
                  {category.name}
                </button>
                
                {index < displayedCategories.length - 1 && (
                  <span className="text-gray-400 select-none">•</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {menuState.isOpen && (
        <>
          {/* Zone tampon et menu */}
          <div
            ref={menuZoneRef}
            className="fixed inset-0 z-40"
            onMouseEnter={handleMenuZoneEnter}
            onMouseLeave={handleMenuZoneLeave}
          >
            {/* Backdrop avec flou */}
            <div className="fixed inset-0 bg-black/5 backdrop-blur-[1px]" />
            
            {/* Container du menu */}
            <div 
              ref={menuRef}
              className={`fixed left-0 right-0 bg-white border-b border-gray-200/80 shadow-sm transition-opacity duration-200 ${
                menuState.isTransitioning ? 'opacity-90' : 'opacity-100'
              }`}
              style={{ top: '96px' }}
            >
              {menuState.currentCategory && renderCategoryContent(
                displayedCategories.find(cat => cat.id === menuState.currentCategory)!
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
