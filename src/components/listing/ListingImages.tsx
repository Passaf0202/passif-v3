
import { useState } from 'react';
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "../ui/dialog";

interface ListingImagesProps {
  images: string[];
  title: string;
  isHovered?: boolean;
  onImageClick?: (e: React.MouseEvent, image: string) => void;
}

export const ListingImages = ({ 
  images, 
  title, 
  isHovered = false
}: ListingImagesProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const navigate = useNavigate();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg";
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setIsZoomed(true);
  };

  return (
    <div className="relative">
      {/* Boutons Retour et Favoris */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-white/80 hover:bg-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-10 favorite-button">
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-white/80 hover:bg-white"
        >
          <Heart className="h-5 w-5 text-gray-700" />
        </Button>
      </div>

      {/* Image principale */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <img
          src={images[0] || "/placeholder.svg"}
          alt={title}
          className="h-full w-full object-contain cursor-zoom-in"
          onClick={() => handleImageClick(images[0])}
          onError={handleImageError}
        />
      </div>

      {/* Galerie d'images miniatures */}
      <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${title} - Image ${index + 1}`}
            className="h-20 w-20 object-cover cursor-pointer rounded"
            onClick={() => handleImageClick(image)}
            onError={handleImageError}
          />
        ))}
      </div>

      {/* Modal de zoom */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-screen-lg p-0">
          <div className="relative w-full h-[80vh]">
            <img
              src={selectedImage || images[0]}
              alt={title}
              className="w-full h-full object-contain"
              onError={handleImageError}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
