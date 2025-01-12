import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ListingHeaderProps {
  title: string;
  price: number;
}

export const ListingHeader = ({ title, price }: ListingHeaderProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        text: `Découvrez ${title} sur notre plateforme !`,
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans votre presse-papier",
      });
    }
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-2xl font-bold text-primary mt-2">{price} €</p>
      </div>
      <Button variant="ghost" size="icon" onClick={handleShare}>
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
};