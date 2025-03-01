
import { useNavigate } from "react-router-dom";
import { getCategoryIcon } from "@/utils/categoryIcons";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Circle, CircleDot } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const TOP_CATEGORIES = [
  "Mode",
  "Électronique",
  "Maison & Jardin",
  "Véhicules",
  "Sport & Loisirs",
  "Immobilier",
  "Animaux",
  "Services",
  "Emploi",
  "Famille"
];

export function TopCategoriesSection() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          <span className="highlight-stabilo">Top catégories</span>
        </h2>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
          onSelect={(index) => setActiveIndex(index)}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {TOP_CATEGORIES.map((category) => {
              const Icon = getCategoryIcon(category);
              return (
                <CarouselItem 
                  key={category} 
                  className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5"
                >
                  <div 
                    onClick={() => navigate(`/search?category=${encodeURIComponent(category)}`)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-medium text-gray-900 text-center">
                        {category}
                      </h3>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
        
        {/* Indicateurs de défilement */}
        <div className="flex justify-center mt-6">
          {isMobile ? (
            <div className="flex gap-2 items-center">
              {Array.from({ length: Math.min(TOP_CATEGORIES.length, 10) }).map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className="focus:outline-none"
                  aria-label={`Aller à la catégorie ${index + 1}`}
                >
                  {index === activeIndex % TOP_CATEGORIES.length ? (
                    <CircleDot className="w-4 h-4 text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center text-gray-500 text-sm">
              <span>Utilisez les flèches pour naviguer</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
