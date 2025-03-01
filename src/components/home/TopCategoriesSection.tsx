
import { useNavigate } from "react-router-dom";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Circle, CircleDot } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

const TOP_CATEGORIES = ["Mode", "Électronique", "Maison & Jardin", "Véhicules", "Sport & Loisirs"];

export function TopCategoriesSection() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState<any>(null);

  // Fonction pour naviguer vers un slide spécifique quand on clique sur un indicateur
  const scrollToIndex = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  // Synchroniser l'index actif avec l'API Embla
  useEffect(() => {
    if (emblaApi) {
      const onSelect = () => {
        setActiveIndex(emblaApi.selectedScrollSnap());
      };
      emblaApi.on('select', onSelect);
      // Initialiser l'index actif
      setActiveIndex(emblaApi.selectedScrollSnap());
      return () => {
        emblaApi.off('select', onSelect);
      };
    }
    return undefined;
  }, [emblaApi]);

  return <section className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center mb-8">
          <span className="highlight-stabilo font-bold text-3xl">Top catégories</span>
        </h2>
        
        <Carousel opts={{
        align: "start",
        loop: true
      }} className="w-full" setApi={setEmblaApi}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {TOP_CATEGORIES.map(category => {
            const Icon = getCategoryIcon(category);
            return <CarouselItem key={category} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                  <div onClick={() => navigate(`/search?category=${encodeURIComponent(category)}`)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-medium text-gray-900 text-center">
                        {category}
                      </h3>
                    </div>
                  </div>
                </CarouselItem>;
          })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
        
        <div className="flex justify-center mt-6">
          {isMobile ? <div className="flex gap-2 items-center">
              {TOP_CATEGORIES.map((_, index) => <button key={index} onClick={() => scrollToIndex(index)} className="focus:outline-none" aria-label={`Aller à la catégorie ${index + 1}`}>
                  {index === activeIndex ? <CircleDot className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-gray-300" />}
                </button>)}
            </div> : <div className="flex items-center text-gray-500 text-sm">
              <span>Utilisez les flèches pour naviguer</span>
            </div>}
        </div>
      </div>
    </section>;
}
