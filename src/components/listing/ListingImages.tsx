
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
  const [useDarkLogo, setUseDarkLogo] = useState<boolean[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg";
  };

  useEffect(() => {
    const checkImageBrightness = async (imageUrl: string, index: number) => {
      try {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let brightness = 0;
        
        for (let i = 0; i < imageData.length; i += 4) {
          brightness += (imageData[i] * 0.299 + imageData[i + 1] * 0.587 + imageData[i + 2] * 0.114);
        }
        
        brightness = brightness / (imageData.length / 4);
        
        setUseDarkLogo(prev => {
          const newState = [...prev];
          newState[index] = brightness < 128;
          return newState;
        });
      } catch (error) {
        console.error('Error analyzing image brightness:', error);
      }
    };

    images.forEach((image, index) => {
      checkImageBrightness(image, index);
    });
  }, [images]);

  return (
    <>
      <div className="relative h-[500px] bg-gray-100 rounded-lg overflow-hidden">
        {images.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index} className="relative">
                  <img
                    src={image}
                    alt={`${title} - Image ${index + 1}`}
                    className="w-full h-[500px] object-contain cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                    onError={handleImageError}
                  />
                  <div className="absolute top-4 left-4 w-16">
                    <img
                      src={useDarkLogo[index] 
                        ? "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20blanc.png"
                        : "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//tradecoiner-logo.svg.png"
                      }
                      alt="Tradecoiner"
                      className="w-full h-auto object-contain"
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

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <img
            src={selectedImage || ''}
            alt={title}
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
