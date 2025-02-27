
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
  Info,
  Smartphone,
} from "lucide-react";
import { formatPrice } from "@/utils/priceUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from 'wagmi';
import { useIsMobile } from "@/hooks/use-mobile";
import { QRCodePayment } from "@/components/payment/QRCodePayment";
import { PaymentButton } from "@/components/payment/PaymentButton";
import { usePaymentTransaction } from "@/hooks/usePaymentTransaction";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { DiamondViewer } from "@/components/home/DiamondViewer";
import { DiamondViewerState } from "@/components/home/types/diamond-viewer";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const [productImage, setProductImage] = useState<string>("/placeholder.svg");
  const isMobile = useIsMobile();
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [diamondState, setDiamondState] = useState<DiamondViewerState>("initial");

  const storedCheckoutData = JSON.parse(localStorage.getItem('checkoutData') || '{}');

  const { 
    listingId = storedCheckoutData.listingId,
    sellerAddress = storedCheckoutData.sellerAddress,
    title = storedCheckoutData.title,
    price = storedCheckoutData.price,
    cryptoAmount = storedCheckoutData.cryptoAmount,
    cryptoCurrency = storedCheckoutData.cryptoCurrency,
    productImageUrl = storedCheckoutData.productImageUrl
  } = location.state || {};

  useEffect(() => {
    if (productImageUrl) {
      setProductImage(productImageUrl);
      setImageLoaded(true);
    }
  }, [productImageUrl]);

  useEffect(() => {
    if (listingId && sellerAddress) {
      const checkoutData = {
        listingId,
        sellerAddress,
        title,
        price,
        cryptoAmount,
        cryptoCurrency,
        productImageUrl: productImage !== "/placeholder.svg" ? productImage : productImageUrl
      };
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    }
  }, [listingId, sellerAddress, title, price, cryptoAmount, cryptoCurrency, productImage, productImageUrl]);

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
      
      if (data.images && data.images.length > 0) {
        console.log("Setting product image from DB:", data.images[0]);
        setProductImage(data.images[0]);
        setImageLoaded(true);
        
        const updatedCheckoutData = {
          ...JSON.parse(localStorage.getItem('checkoutData') || '{}'),
          productImageUrl: data.images[0]
        };
        localStorage.setItem('checkoutData', JSON.stringify(updatedCheckoutData));
      }
      
      return data;
    },
    enabled: !!listingId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const { handlePayment } = usePaymentTransaction({
    listingId,
    address: sellerAddress,
    onPaymentComplete: (transactionId: string) => {
      navigate(`/payment/${transactionId}`);
    }
  });

  useEffect(() => {
    if (!listingId && !storedCheckoutData.listingId) {
      toast({
        title: "Erreur",
        description: "Informations de paiement manquantes",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [listingId, storedCheckoutData.listingId, navigate, toast]);

  useEffect(() => {
    if (listingId && !isConnected) {
      toast({
        title: "Attention",
        description: "Veuillez connecter votre portefeuille pour effectuer le paiement",
      });
    }
  }, [isConnected, toast, listingId]);

  const getPaymentUrl = () => {
    return `https://tradecoiner.app/pay/${listingId}?amount=${cryptoAmount}&to=${sellerAddress}`;
  };

  const handleBack = () => {
    navigate(`/listings/${listingId}`);
  };

  const handleProcessPayment = async () => {
    if (!isConnected) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre portefeuille pour payer",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      setDiamondState("processing");
      await handlePayment();
    } catch (error) {
      console.error("Erreur de paiement:", error);
      setDiamondState("initial");
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("Image error, using placeholder");
    e.currentTarget.src = "/placeholder.svg";
    setImageLoaded(true);
  };

  const handleImageLoaded = () => {
    console.log("Image loaded successfully");
    setImageLoaded(true);
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

  if (!listing && isLoading === false && !storedCheckoutData.listingId) {
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

  if (isMobile) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={handleBack}
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
                  <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    {!imageLoaded && <div className="animate-pulse h-full w-full bg-gray-200"></div>}
                    <img 
                      src={productImage} 
                      alt={title}
                      className={`h-full w-full object-cover ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                      onError={handleImageError}
                      onLoad={handleImageLoaded}
                    />
                  </div>
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

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center relative">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          {/* Diamant à côté de la croix */}
          <div className="h-14 w-14 absolute right-4 top-0">
            <DiamondViewer state={diamondState} scale={1.8} />
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Finaliser l'achat</h1>
          </div>
          
          <Card className="w-full">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden shadow-sm">
                  {!imageLoaded && <div className="animate-pulse h-full w-full bg-gray-200"></div>}
                  <img 
                    src={productImage} 
                    alt={title}
                    className={`h-full w-full object-cover ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                    onError={handleImageError}
                    onLoad={handleImageLoaded}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{title}</h2>
                  <div className="flex items-baseline gap-4 mt-1">
                    <p className="text-2xl font-bold">{formatPrice(price)} EUR</p>
                    <p className="text-sm text-muted-foreground">
                      ≈ {cryptoAmount?.toFixed(8)} {cryptoCurrency}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Détails du produit</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Crypto-monnaie acceptée</span>
                    <span className="font-medium">{cryptoCurrency}</span>
                  </div>
                  {listing?.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Catégorie</span>
                      <span className="font-medium">{listing.category}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendeur</span>
                    <span className="font-medium">{listing?.user?.full_name}</span>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    className="w-full py-7 text-base font-medium"
                    disabled={!isConnected || isProcessing}
                    onClick={handleProcessPayment}
                  >
                    {isProcessing ? "Traitement en cours..." : "Payer"}
                  </Button>
                  
                  <ContactModal
                    listingId={listingId}
                    sellerId={listing?.user?.id || ""}
                    listingTitle={title}
                  />
                </div>
                
                <Dialog open={openQrDialog} onOpenChange={setOpenQrDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full py-2 text-sm border-gray-200 bg-gray-50"
                      disabled={!isConnected}
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Payer via téléphone
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Scannez pour payer sur téléphone</DialogTitle>
                    </DialogHeader>
                    <QRCodePayment 
                      paymentUrl={getPaymentUrl()}
                      sellerAddress={sellerAddress}
                      cryptoAmount={cryptoAmount}
                      cryptoCurrency={cryptoCurrency}
                      isConnected={isConnected}
                      listingId={listingId}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-center gap-8">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                      <ShieldCheck className="h-4 w-4" />
                      Protection acheteur
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold mb-4">Protection acheteur</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">Politique de remboursement</h4>
                        <p className="text-gray-600 mb-2">
                          Tu peux obtenir un remboursement si ta commande :
                        </p>
                        <ul className="list-disc ml-5 text-gray-600">
                          <li>est perdue ou n'est jamais livrée</li>
                          <li>arrive endommagée</li>
                          <li>n'est pas du tout conforme à sa description</li>
                        </ul>
                        <p className="text-gray-600 mt-2">
                          Tu disposes de 2 jours pour soumettre une réclamation à compter du moment où la livraison de la commande t'est notifiée, même si l'article n'a jamais été livré.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Transactions sécurisées</h4>
                        <p className="text-gray-600">
                          Ton paiement est conservé en toute sécurité pendant toute la durée de la transaction. Les paiements sont cryptés par notre partenaire de paiement, ton argent est donc toujours envoyé ou reçu en toute sécurité. Le vendeur n'aura jamais accès à tes informations de paiement.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                      <Lock className="h-4 w-4" />
                      Paiement sécurisé
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold mb-4">Smart Contract</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <p className="text-gray-600">
                        Notre technologie de smart contract garantit que votre paiement reste sécurisé jusqu'à ce que:
                      </p>
                      <ul className="list-disc ml-5 text-gray-600">
                        <li>Vous confirmiez la réception du produit</li>
                        <li>Le délai de protection acheteur expire (30 jours)</li>
                        <li>Un médiateur résout un litige éventuel</li>
                      </ul>
                      <p className="text-gray-600">
                        Les fonds ne sont jamais directement accessibles au vendeur avant ces conditions.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                En cliquant sur "Payer", vous acceptez les conditions du service 
                et la politique de protection de l'acheteur.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { ListingActions } from "@/components/listing/ListingActions";
import { ContactModal } from "@/components/ContactModal";
