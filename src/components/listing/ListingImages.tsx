interface ListingImagesProps {
  images: string[];
  title: string;
}

export const ListingImages = ({ images, title }: ListingImagesProps) => {
  return (
    <div className="space-y-4">
      {images?.map((image: string, index: number) => (
        <img
          key={index}
          src={image}
          alt={`${title} - Image ${index + 1}`}
          className="w-full rounded-lg"
        />
      ))}
    </div>
  );
};