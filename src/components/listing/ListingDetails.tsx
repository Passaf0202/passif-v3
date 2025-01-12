import { Shield } from "lucide-react";
import { ListingImages } from "./ListingImages";
import { ListingHeader } from "./ListingHeader";
import { SellerInfo } from "./SellerInfo";
import { ListingActions } from "./ListingActions";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface ListingDetailsProps {
  listing: {
    id: string;
    title: string;
    price: number;
    description: string;
    images: string[];
    location: string;
    user_id: string;
    brand?: string;
    condition?: string;
    color?: string[];
    material?: string[];
    user: {
      avatar_url: string | null;
      full_name: string;
    };
  };
}

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBuy = () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour acheter",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/checkout", { state: { listing } });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ListingImages images={listing.images} title={listing.title} />

      <div className="space-y-6">
        <ListingHeader title={listing.title} price={listing.price} />
        
        <SellerInfo seller={listing.user} location={listing.location} />

        <div className="p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-700">Protection Acheteurs</p>
            <p className="text-sm text-blue-600">
              Paiement sécurisé via notre plateforme
            </p>
          </div>
        </div>

        <ListingActions
          listingId={listing.id}
          sellerId={listing.user_id}
          title={listing.title}
          price={listing.price}
          onBuy={handleBuy}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Détails</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Marque</p>
              <p>{listing.brand || "Non spécifié"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">État</p>
              <p>{listing.condition || "Non spécifié"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Couleur</p>
              <p>{listing.color?.join(", ") || "Non spécifié"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Matière</p>
              <p>{listing.material?.join(", ") || "Non spécifié"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};