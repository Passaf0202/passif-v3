
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { useMobileCategories } from "./categories/useMobileCategories";

export function MobileCategoryBar() {
  const navigate = useNavigate();

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

  if (!categories?.length) return null;

  return (
    <div className="md:hidden border-b border-gray-200/80 bg-white relative overflow-hidden">
      {/* Gradient de fade à gauche - plus large et plus progressif */}
      <div className="absolute left-0 top-0 w-48 h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full px-4"
      >
        <CarouselContent className="-ml-2">
          {categories.map((category, index) => (
            <CarouselItem 
              key={category.id} 
              className="pl-2 basis-auto"
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
      </Carousel>

      {/* Gradient de fade à droite - plus large et plus progressif */}
      <div className="absolute right-0 top-0 w-48 h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
