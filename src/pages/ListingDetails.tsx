import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/ContactModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Share2, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [offerAmount, setOfferAmount] = useState("");
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleMakeOffer = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour faire une offre",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    // Here we would typically send the offer to the backend
    toast({
      title: "Succès",
      description: "Votre offre a été envoyée au vendeur",
    });
    setIsOfferModalOpen(false);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing?.title,
        text: `Découvrez ${listing?.title} sur notre plateforme !`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans votre presse-papier",
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Annonce non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {listing.images?.map((image: string, index: number) => (
              <img
                key={index}
                src={image}
                alt={`${listing.title} - Image ${index + 1}`}
                className="w-full rounded-lg"
              />
            ))}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                <p className="text-2xl font-bold text-primary mt-2">{listing.price} €</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src={listing.user.avatar_url || "/placeholder.svg"}
                alt={listing.user.full_name}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{listing.user.full_name}</p>
                <p className="text-sm text-gray-500">{listing.location}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-700">Protection Acheteurs</p>
                  <p className="text-sm text-blue-600">
                    Paiement sécurisé via notre plateforme
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  className="w-full"
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Erreur",
                        description: "Vous devez être connecté pour acheter",
                        variant: "destructive",
                      });
                      return;
                    }
                    // Handle buy action
                  }}
                >
                  Acheter
                </Button>
                
                <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Faire une offre
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Faire une offre</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Prix actuel : {listing.price} €
                      </p>
                      <Input
                        type="number"
                        placeholder="Votre offre en €"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                      />
                      <Button className="w-full" onClick={handleMakeOffer}>
                        Envoyer l'offre
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" className="w-full" asChild>
                  <ContactModal
                    listingId={listing.id}
                    sellerId={listing.user_id}
                    listingTitle={listing.title}
                  />
                </Button>
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

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
      </div>
    </div>
  );
}