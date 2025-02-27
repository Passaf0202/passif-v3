
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { ListingActions } from "@/components/listing/ListingActions";
import { formatPrice } from "@/utils/priceUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const [productImage, setProductImage] = useState<string>("/placeholder.svg");
  
  // Récupérer les paramètres depuis l'état de navigation
  const { 
    listingId,
    sellerAddress,
    title,
    price,
    cryptoAmount,
    cryptoCurrency
  } = location.state || {};

  // Récupérer les détails de l'annonce
  const { data: listing, isLoading } = useQuery({
    queryKey: ["checkout-listing", listingId],
    queryFn: async () => {
      if (!listingId) return null;
      
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            id,
            full_name,
            avatar_url,
            wallet_address
          )
        `)
        .eq("id", listingId)
        .single();

      if (error) {
        console.error("Error fetching listing:", error);
        throw error;
      }
      
      // Définir l'image principale
      if (data.images && data.images.length > 0) {
        setProductImage(data.images[0]);
      }
      
      return data;
    },
    enabled: !!listingId,
  });

  useEffect(() => {
    // Si pas de paramètres, rediriger vers la page d'accueil
    if (!listingId || !sellerAddress) {
      toast({
        title: "Erreur",
        description: "Informations de paiement manquantes",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [listingId, sellerAddress, navigate, toast]);

  // Si l'utilisateur n'est pas connecté au wallet, l'avertir
  useEffect(() => {
    if (listingId && !isConnected) {
      toast({
        title: "Attention",
        description: "Veuillez connecter votre portefeuille pour effectuer le paiement",
      });
    }
  }, [isConnected, toast, listingId]);

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto">
            <Card className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
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
          <div className="max-w-lg mx-auto">
            <Card>
              <CardContent className="p-6">
                <p className="text-center py-6 text-muted-foreground">
                  Annonce non trouvée ou supprimée.
                </p>
                <Button 
                  onClick={() => navigate("/")}
                  variant="secondary"
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Finaliser l'achat</h1>
              </div>

              <div className="flex items-center space-x-4">
                <img 
                  src={productImage} 
                  alt={title}
                  className="h-16 w-16 object-cover rounded-md" 
                />
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <div className="flex items-baseline gap-4">
                    <p className="text-2xl font-bold">{formatPrice(price)} EUR</p>
                    <p className="text-sm text-muted-foreground">
                      ≈ {cryptoAmount?.toFixed(8)} {cryptoCurrency}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Détails du produit</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Crypto-monnaie acceptée</span>
                    <span>{cryptoCurrency}</span>
                  </div>
                  {listing.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Catégorie</span>
                      <span>{listing.category}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendeur</span>
                    <span>{listing.user?.full_name}</span>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-medium">Protection acheteur incluse</span>
                </div>
                
                <div className="flex items-center gap-2 text-blue-600">
                  <Lock className="h-5 w-5" />
                  <span className="text-sm font-medium">Paiement sécurisé via smart contract</span>
                </div>
              </div>
              
              <div className="pt-4">
                <ListingActions
                  listingId={listingId}
                  sellerId={listing.user?.id || ""}
                  sellerAddress={sellerAddress}
                  title={title}
                  price={price}
                  cryptoAmount={cryptoAmount}
                  cryptoCurrency={cryptoCurrency}
                  isCheckoutPage={true}
                />
                <p className="text-xs text-center mt-4 text-muted-foreground">
                  En cliquant sur "Payer", vous acceptez les conditions du service 
                  et la politique de protection de l'acheteur.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
