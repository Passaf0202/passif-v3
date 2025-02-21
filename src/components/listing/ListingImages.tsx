
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ListingImagesProps {
  images: string[];
  title: string;
  isHovered?: boolean;
  onImageClick?: (e: React.MouseEvent, image: string) => void;
}

export const ListingImages = ({ 
  images, 
  title, 
  isHovered = false,
  onImageClick 
}: ListingImagesProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg";
  };

  return (
    <div className="relative h-[500px] bg-gray-100 rounded-lg overflow-hidden">
      {images.length > 0 ? (
        <Carousel className="w-full h-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index} className="relative">
                <img
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  className="w-full h-[500px] object-contain"
                  onClick={(e) => onImageClick?.(e, image)}
                  onError={handleImageError}
                />
                <div className="absolute top-4 left-4">
                  <img
                    src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//tradecoiner-logo.svg.png"
                    alt="Tradecoiner"
                    className="w-24 h-auto opacity-90"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`w-2 h-2 rounded-full p-0 ${
                  currentImage === index ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>
        </Carousel>
      ) : (
        <div className="flex items-center justify-center h-full">
          <img
            src="/placeholder.svg"
            alt={title}
            className="max-h-full"
            onError={handleImageError}
          />
        </div>
      )}
    </div>
  );
};
