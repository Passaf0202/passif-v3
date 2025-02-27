
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Info 
} from "lucide-react";
import { ListingActions } from "@/components/listing/ListingActions";
import { formatPrice } from "@/utils/priceUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from 'wagmi';
import { useIsMobile } from "@/hooks/use-mobile";
import { QRCodePayment } from "@/components/payment/QRCodePayment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const [productImage, setProductImage] = useState<string>("/placeholder.svg");
  const isMobile = useIsMobile();
  
  // Récupérer les paramètres depuis l'état de navigation OU depuis le localStorage
  const storedCheckoutData = JSON.parse(localStorage.getItem('checkoutData') || '{}');
  
  // Utiliser les données stockées si elles existent, sinon utiliser les données de location.state
  const { 
    listingId = storedCheckoutData.listingId,
    sellerAddress = storedCheckoutData.sellerAddress,
    title = storedCheckoutData.title,
    price = storedCheckoutData.price,
    cryptoAmount = storedCheckoutData.cryptoAmount,
    cryptoCurrency = storedCheckoutData.cryptoCurrency
  } = location.state || {};
  
  // Sauvegarder les données de checkout dans localStorage pour les restaurer en cas de rafraîchissement
  useEffect(() => {
    if (listingId && sellerAddress) {
      const checkoutData = {
        listingId,
        sellerAddress,
        title,
        price,
        cryptoAmount,
        cryptoCurrency
      };
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    }
  }, [listingId, sellerAddress, title, price, cryptoAmount, cryptoCurrency]);

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
    // Désactiver le refetching automatique
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    // Si pas de paramètres, rediriger vers la page d'accueil seulement si aucune donnée n'est sauvegardée
    if (!listingId && !storedCheckoutData.listingId) {
      toast({
        title: "Erreur",
        description: "Informations de paiement manquantes",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [listingId, storedCheckoutData.listingId, navigate, toast]);

  // Si l'utilisateur n'est pas connecté au wallet, l'avertir
  useEffect(() => {
    if (listingId && !isConnected) {
      toast({
        title: "Attention",
        description: "Veuillez connecter votre portefeuille pour effectuer le paiement",
      });
    }
  }, [isConnected, toast, listingId]);

  // Générer une URL de paiement pour le QR code
  const getPaymentUrl = () => {
    // Dans un cas réel, cela pourrait être une URL spécifique avec des paramètres
    // pour le moment, nous utilisons une URL simple pour la démonstration
    return `https://tradecoiner.app/pay/${listingId}?amount=${cryptoAmount}&to=${sellerAddress}`;
  };

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

  if (!listing && isLoading === false) {
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

  // Rendu pour mobile - reste inchangé
  if (isMobile) {
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
                    {listing?.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Catégorie</span>
                        <span>{listing.category}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vendeur</span>
                      <span>{listing?.user?.full_name}</span>
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
                    sellerId={listing?.user?.id || ""}
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

  // Rendu amélioré pour desktop
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Finaliser l'achat</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Colonne de gauche - détails du produit - taille équilibrée */}
            <div className="md:h-full">
              <Card className="h-full">
                <CardContent className="p-8 space-y-8 h-full flex flex-col">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={productImage} 
                      alt={title}
                      className="h-24 w-24 object-cover rounded-md shadow-sm" 
                    />
                    <div>
                      <h2 className="text-2xl font-semibold">{title}</h2>
                      <div className="flex items-baseline gap-4 mt-2">
                        <p className="text-3xl font-bold">{formatPrice(price)} EUR</p>
                        <p className="text-sm text-muted-foreground">
                          ≈ {cryptoAmount?.toFixed(8)} {cryptoCurrency}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-4">Détails du produit</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-lg">Crypto-monnaie acceptée</span>
                        <span className="font-medium">{cryptoCurrency}</span>
                      </div>
                      {listing?.category && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-lg">Catégorie</span>
                          <span className="font-medium">{listing.category}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-lg">Vendeur</span>
                        <span className="font-medium">{listing?.user?.full_name}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="space-y-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors w-full justify-center">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="font-medium">Protection acheteur incluse</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-4 bg-white shadow-lg border border-gray-200 rounded-lg">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-green-700">Protection acheteur</h4>
                            <p className="text-sm text-gray-600">
                              Notre système de protection garantit un remboursement si:
                              <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li>L'article n'est jamais livré</li>
                                <li>L'article est significativement différent de sa description</li>
                                <li>L'article est endommagé à la réception</li>
                              </ul>
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors w-full justify-center">
                            <Lock className="h-5 w-5" />
                            <span className="font-medium">Paiement sécurisé via smart contract</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-4 bg-white shadow-lg border border-gray-200 rounded-lg">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-blue-700">Smart Contract</h4>
                            <p className="text-sm text-gray-600">
                              Notre technologie de smart contract garantit que votre paiement reste sécurisé jusqu'à ce que:
                              <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li>Vous confirmiez la réception du produit</li>
                                <li>Le délai de protection acheteur expire (30 jours)</li>
                                <li>Un médiateur résout un litige éventuel</li>
                              </ul>
                              Les fonds ne sont jamais directement accessibles au vendeur avant ces conditions.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Colonne de droite - options de paiement */}
            <div className="md:h-full">
              <Card className="h-full">
                <CardContent className="p-8 space-y-6 h-full flex flex-col">
                  <h2 className="text-2xl font-semibold">Méthode de paiement</h2>
                  
                  <Tabs defaultValue="browser" className="w-full flex-grow">
                    <TabsList className="grid w-full grid-cols-2 rounded-full">
                      <TabsTrigger value="browser" className="rounded-full data-[state=active]:bg-black data-[state=active]:text-white">
                        Payer via navigateur
                      </TabsTrigger>
                      <TabsTrigger value="mobile" className="rounded-full data-[state=active]:bg-black data-[state=active]:text-white">
                        Payer via téléphone
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="browser" className="mt-6 flex-grow flex flex-col">
                      <div className="space-y-6 flex-grow">
                        <p className="text-muted-foreground text-sm">
                          Utilisez votre extension de wallet (Metamask, Coinbase Wallet...) pour payer directement depuis votre navigateur.
                        </p>
                        
                        <div className="flex-grow flex items-center justify-center">
                          <div className="w-full max-w-md">
                            <ListingActions
                              listingId={listingId}
                              sellerId={listing?.user?.id || ""}
                              sellerAddress={sellerAddress}
                              title={title}
                              price={price}
                              cryptoAmount={cryptoAmount}
                              cryptoCurrency={cryptoCurrency}
                              isCheckoutPage={true}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="mobile" className="mt-6 flex-grow">
                      <QRCodePayment 
                        paymentUrl={getPaymentUrl()}
                        sellerAddress={sellerAddress}
                        cryptoAmount={cryptoAmount}
                        cryptoCurrency={cryptoCurrency}
                        isConnected={isConnected}
                        listingId={listingId}
                      />
                    </TabsContent>
                  </Tabs>

                  <p className="text-xs text-center mt-4 text-muted-foreground">
                    En cliquant sur "Payer", vous acceptez les conditions du service 
                    et la politique de protection de l'acheteur.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
