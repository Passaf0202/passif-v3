
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "../ui/dialog";
import { FavoriteButton } from "./FavoriteButton";

// Constantes pour les tailles d'images
const THUMBNAIL_SIZE = '100x100';
const PREVIEW_SIZE = '300x300';
const FULLSIZE_LOAD_DELAY = 500; // ms

interface ListingImagesProps {
  images: string[];
  title: string;
  isHovered?: boolean;
  onImageClick?: (e: React.MouseEvent, image: string) => void;
  listingId?: string;
}

export const ListingImages = ({ 
  images, 
  title, 
  isHovered = false,
  listingId
}: ListingImagesProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [loadFullSize, setLoadFullSize] = useState(false);
  
  // Optimisation des images en utilisant des thumbnails automatiquement
  const optimizeImageUrl = (url: string, size: string = PREVIEW_SIZE): string => {
    if (!url) return "/placeholder.svg";
    
    // Si c'est déjà une URL optimisée ou un placeholder, on ne la modifie pas
    if (url.includes('/placeholder.svg') || url.includes('_optimized')) {
      return url;
    }
    
    // Pour les images stockées sur Supabase
    if (url.includes('supabase.co')) {
      // Construire une URL avec paramètres de redimensionnement pour Supabase Storage
      // Format: original_url?width=300&height=300&resize=cover
      return `${url}?width=${size.split('x')[0]}&height=${size.split('x')[1]}&resize=cover&quality=80`;
    }
    
    return url;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg";
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setIsZoomed(true);
    setLoadFullSize(false);
    
    // Charge l'image en taille réelle après un délai pour améliorer l'UX
    setTimeout(() => setLoadFullSize(true), FULLSIZE_LOAD_DELAY);
  };
  
  // S'assurer que les images existent et ont un format valide
  const validImages = images?.filter(img => img && typeof img === 'string') || [];
  const mainImage = validImages.length > 0 ? validImages[0] : "/placeholder.svg";

  return (
    <div className="relative">
      {/* Bouton Favoris - Utiliser le composant FavoriteButton seulement si listingId est fourni */}
      {listingId && (
        <div className="absolute top-4 right-4 z-10 favorite-button">
          <FavoriteButton listingId={listingId} isHovered={true} />
        </div>
      )}

      {/* Image principale - version optimisée */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <img
          src={optimizeImageUrl(mainImage)}
          alt={title}
          className="h-full w-full object-contain cursor-zoom-in"
          onClick={() => handleImageClick(mainImage)}
          onError={handleImageError}
          loading="lazy" // Chargement paresseux
        />
      </div>

      {/* Galerie d'images miniatures - versions très optimisées */}
      {validImages.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <img
              key={index}
              src={optimizeImageUrl(image, THUMBNAIL_SIZE)}
              alt={`${title} - Image ${index + 1}`}
              className="h-20 w-20 object-cover cursor-pointer rounded"
              onClick={() => handleImageClick(image)}
              onError={handleImageError}
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Modal de zoom - charge d'abord une version optimisée puis la version complète */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-screen-lg p-0">
          <div className="relative w-full h-[80vh]">
            <img
              src={loadFullSize ? selectedImage || mainImage : optimizeImageUrl(selectedImage || mainImage)}
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
