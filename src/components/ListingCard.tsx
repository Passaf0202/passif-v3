import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ContactModal } from "@/components/ContactModal";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  sellerId: string;
}

export const ListingCard = ({ id, title, price, location, image, sellerId }: ListingCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <img
          src={image}
          alt={title}
          className="h-48 w-full object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-2xl font-bold text-primary">{price} €</p>
        <p className="text-sm text-gray-500">{location}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <ContactModal
          listingId={id}
          sellerId={sellerId}
          listingTitle={title}
        />
      </CardFooter>
    </Card>
  );
};