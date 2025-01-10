import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface ListingCardProps {
  title: string;
  price: number;
  location: string;
  image: string;
}

export const ListingCard = ({ title, price, location, image }: ListingCardProps) => {
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
        <Button variant="outline" className="w-full">
          <MessageCircle className="mr-2 h-4 w-4" />
          Contacter
        </Button>
      </CardFooter>
    </Card>
  );
};