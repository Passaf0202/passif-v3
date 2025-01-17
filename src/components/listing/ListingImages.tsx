interface ListingImagesProps {
  images: string[];
  title: string;
  isHovered?: boolean;
}

export const ListingImages = ({ images, title, isHovered = false }: ListingImagesProps) => {
  return (
    <div className="relative aspect-square overflow-hidden">
      <img
        src={images[0]}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-300"
      />
      {isHovered && images.length > 1 && (
        <img
          src={images[1]}
          alt={`${title} - Image 2`}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
    </div>
  );
};