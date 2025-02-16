
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { useMobileCategories } from "./categories/useMobileCategories";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export function MobileCategoryBar() {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
    containScroll: "keepSnaps",
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFirstSlide, setIsFirstSlide] = useState(true);

  const { data: fetchedCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  // Utiliser la liste plate ordonnée pour mobile
  const categories = useMobileCategories(fetchedCategories);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/category/${categoryName.toLowerCase()}`);
  };

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const currentIndex = emblaApi.selectedScrollSnap();
      setIsFirstSlide(currentIndex === 0);
    };

    const onScroll = () => {
      const progress = emblaApi.scrollProgress();
      setScrollProgress(progress);
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("scroll", onScroll);

    // Initial state
    onSelect();
    onScroll();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("scroll", onScroll);
    };
  }, [emblaApi]);

  if (!categories?.length) return null;

  // Calculer l'opacité des gradients en fonction de la position
  const leftGradientOpacity = isFirstSlide ? 0 : Math.min(1, scrollProgress * 2);
  const rightGradientOpacity = Math.min(1, (1 - scrollProgress) * 2);

  return (
    <div className="md:hidden border-b border-gray-200/80 bg-white relative overflow-hidden">
      {/* Gradient de fade à gauche - dynamique */}
      <div 
        className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-200"
        style={{ opacity: leftGradientOpacity }}
      />
      
      <div className="overflow-hidden" ref={emblaRef}>
        <CarouselContent className="-ml-2">
          {categories.map((category, index) => (
            <CarouselItem 
              key={category.id} 
              className={`pl-2 basis-auto ${index === 0 ? 'ml-4' : ''}`}
            >
              <div className="flex items-center">
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className="whitespace-nowrap px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  {capitalizeFirstLetter(category.name)}
                </button>
                {index < categories.length - 1 && (
                  <span className="text-gray-300 select-none">•</span>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>

      {/* Gradient de fade à droite - dynamique */}
      <div 
        className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-200"
        style={{ opacity: rightGradientOpacity }}
      />
    </div>
  );
}
