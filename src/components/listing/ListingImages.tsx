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
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={images[0]}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-300 cursor-pointer"
        onClick={(e) => onImageClick?.(e, images[0])}
      />
      {isHovered && images.length > 1 && (
        <img
          src={images[1]}
          alt={`${title} - Image 2`}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer"
          onClick={(e) => onImageClick?.(e, images[1])}
        />
      )}
    </div>
  );
};