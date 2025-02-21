import React from "react";
import { Shield, Star, MapPin, PackageOpen, Handshake, Calendar, Phone, SmilePlus, Home, ChevronRight } from "lucide-react";
import { ListingImages } from "./ListingImages";
import { ListingHeader } from "./ListingHeader";
import { SellerInfo } from "./SellerInfo";
import { ListingActions } from "./ListingActions";
import { ProductDetailsCard } from "./ProductDetailsCard";
import { LocationMap } from "./LocationMap";
import { useToast } from "@/components/ui/use-toast";
import { useCryptoConversion } from "@/hooks/useCryptoConversion";
import { useQuery } from "@tanstack/react-query";
import { validateAndUpdateCryptoAmount } from "@/hooks/escrow/useCryptoAmount";
import { useEscrowPayment } from "@/hooks/escrow/useEscrowPayment";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "../ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface ListingDetailsProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    user: {
      id: string;
      wallet_address?: string | null;
      avatar_url: string;
      full_name: string;
    } | null;
    location: string;
    user_id: string;
    crypto_amount?: number;
    crypto_currency?: string;
    wallet_address?: string;
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    condition?: string;
    color?: string[];
    transmission?: string;
    fuel_type?: string;
    doors?: number;
    crit_air?: string;
    emission_class?: string;
    shipping_method?: string;
    category?: string;
    subcategory?: string;
    subsubcategory?: string;
  };
}

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  const { toast } = useToast();
  const [showHowItWorks, setShowHowItWorks] = React.useState(false);
  const { createEscrowTransaction } = useEscrowPayment();
  
  const cryptoDetails = useCryptoConversion(listing.price, listing.crypto_currency);
  const isMobile = useIsMobile();

  const { data: listingData } = useQuery({
    queryKey: ['listing-wallet', listing.id],
    queryFn: async () => {
      try {
        const validatedListing = await validateAndUpdateCryptoAmount(listing);
        console.log('Listing with validated crypto amount:', validatedListing);
        return validatedListing;
      } catch (error: any) {
        console.error('Error validating crypto amount:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de calculer le montant en crypto",
          variant: "destructive",
        });
        return listing;
      }
    },
  });

  const handleBuyClick = async () => {
    try {
      console.log("Starting escrow transaction...");
      await createEscrowTransaction({
        listingId: listing.id,
        amount: listingData?.crypto_amount || cryptoDetails?.amount || 0,
        sellerAddress: listingData?.wallet_address || listing.wallet_address || "",
      });
    } catch (error) {
      console.error("Error in handleBuyClick:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la transaction",
        variant: "destructive",
      });
    }
  };

  if (!listing.user) {
    console.error("User information is missing from the listing");
    return (
      <div className="text-center p-4">
        <p>Information du vendeur non disponible</p>
      </div>
    );
  }

  const sellerWalletAddress = listingData?.wallet_address || listing.wallet_address;

  const generateBreadcrumbs = () => {
    const category = listing.category || "Véhicules";
    const region = "Nouvelle-Aquitaine";
    const departement = "Gironde";
    const ville = "Bordeaux";
    
    return [
      { label: 'Accueil', href: '/' },
      { label: category, href: `/categories/${category.toLowerCase()}` },
      { label: region, href: `/region/${region.toLowerCase()}` },
      { label: departement, href: `/departement/${departement.toLowerCase()}` },
      { label: ville, href: `/ville/${ville.toLowerCase()}` },
      { label: listing.title, href: '#' }
    ];
  };

  const breadcrumbs = generateBreadcrumbs();

  const categories = [
    listing.category,
    listing.subcategory,
    listing.subsubcategory
  ].filter(Boolean);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white space-y-4 pb-8">
        {/* Image principale */}
        <div className="w-full">
          <ListingImages images={listing.images} title={listing.title} />
        </div>

        {/* Informations principales */}
        <div className="px-4 space-y-6">
          <div>
            <ListingHeader 
              title={listing.title} 
              price={listing.price} 
              cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
              cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
            />
            <div className="mt-4">
              {categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="mr-2 mb-2">
                  {category}
                </Badge>
              ))}
            </div>
            <ListingActions
              listingId={listing.id}
              sellerId={listing.user_id}
              sellerAddress={sellerWalletAddress}
              title={listing.title}
              price={listing.price}
              cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
              cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
              handleBuyClick={handleBuyClick}
            />
          </div>

          {/* Détails du produit */}
          <ProductDetailsCard details={listing} />

          {/* Description */}
          <section className="bg-white rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </section>

          {/* Carte */}
          <section className="bg-white rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Localisation</h2>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
              </div>
            </div>
            <LocationMap location={listing.location} />
          </section>

          {/* Protection acheteur */}
          <section className="bg-white rounded-xl p-8 space-y-8">
            <h2 className="text-xl font-semibold">Protection Tradecoiner</h2>
            
            <Separator className="my-6" />
            
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <PackageOpen className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Paiement sécurisé</h3>
                  <p className="text-gray-600 text-sm">Votre argent est sécurisé et versé au bon moment</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <SmilePlus className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Support dédié</h3>
                  <p className="text-gray-600 text-sm">Notre service client dédié vous accompagne</p>
                </div>
              </div>

              <a href="#" className="text-primary hover:underline inline-flex items-center gap-2 text-sm font-medium">
                En savoir plus
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-6">
              <div className="flex items-center gap-2">
                <Handshake className="h-6 w-6 text-gray-600" />
                <h2 className="text-xl font-semibold">Remise en main propre sécurisée</h2>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Réservation garantie</h3>
                  <p className="text-gray-600 text-sm">Réservez ce bien jusqu'au rendez-vous avec le vendeur</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Liberté de choix</h3>
                  <p className="text-gray-600 text-sm">Restez libre de refuser ce bien s'il ne correspond pas à vos attentes</p>
                </div>
              </div>

              <button 
                onClick={() => setShowHowItWorks(true)}
                className="text-primary hover:underline inline-flex items-center gap-2 text-sm font-medium"
              >
                Comment ça marche ?
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Profil vendeur */}
          <Card className="bg-white rounded-xl">
            <CardHeader>
              <CardTitle>Profil Vendeur</CardTitle>
            </CardHeader>
            <CardContent>
              <SellerInfo 
                seller={listing.user} 
                location={listing.location} 
                walletAddress={sellerWalletAddress}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <nav className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              <li>
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-500 font-medium">{item.label}</span>
                ) : (
                  <Link 
                    to={item.href} 
                    className="text-gray-600 hover:text-primary transition-colors hover:underline"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <ListingImages images={listing.images} title={listing.title} />
          </div>

          <section className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            <h2 className="text-xl font-semibold">Protection Tradecoiner</h2>
            
            <Separator className="my-6" />
            
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <PackageOpen className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Paiement sécurisé</h3>
                  <p className="text-gray-600 text-sm">Votre argent est sécurisé et versé au bon moment</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <SmilePlus className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Support dédié</h3>
                  <p className="text-gray-600 text-sm">Notre service client dédié vous accompagne</p>
                </div>
              </div>

              <a href="#" className="text-primary hover:underline inline-flex items-center gap-2 text-sm font-medium">
                En savoir plus
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-6">
              <div className="flex items-center gap-2">
                <Handshake className="h-6 w-6 text-gray-600" />
                <h2 className="text-xl font-semibold">Remise en main propre sécurisée</h2>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Réservation garantie</h3>
                  <p className="text-gray-600 text-sm">Réservez ce bien jusqu'au rendez-vous avec le vendeur</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Liberté de choix</h3>
                  <p className="text-gray-600 text-sm">Restez libre de refuser ce bien s'il ne correspond pas à vos attentes</p>
                </div>
              </div>

              <button 
                onClick={() => setShowHowItWorks(true)}
                className="text-primary hover:underline inline-flex items-center gap-2 text-sm font-medium"
              >
                Comment ça marche ?
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-8 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Localisation</h2>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
              </div>
            </div>
            <LocationMap location={listing.location} />
          </section>
        </div>

        <div className="space-y-6">
          <div className="sticky top-4 space-y-6">
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-8">
                <ListingHeader 
                  title={listing.title} 
                  price={listing.price} 
                  cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
                  cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
                />
                
                <Separator className="my-6" />
                
                <ListingActions
                  listingId={listing.id}
                  sellerId={listing.user_id}
                  sellerAddress={sellerWalletAddress}
                  title={listing.title}
                  price={listing.price}
                  cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
                  cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
                  handleBuyClick={handleBuyClick}
                />
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Profil Vendeur</span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm">5.0</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SellerInfo 
                  seller={listing.user} 
                  location={listing.location} 
                  walletAddress={sellerWalletAddress}
                />
              </CardContent>
            </Card>

            <ProductDetailsCard details={listing} className="rounded-xl shadow-sm" />
          </div>
        </div>
      </div>

      <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
        <DialogContent className="bg-white rounded-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-6">
              Les étapes de la remise en main propre avec paiement sécurisé
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <SmilePlus className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Réservation confirmée</h3>
                <p className="text-gray-600">En réservant l'article, le vendeur vous confirme la disponibilité de l'article</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Organisation du rendez-vous</h3>
                <p className="text-gray-600">Vous vous organisez avec le vendeur pour définir le lieu et la date de votre rendez-vous</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Paiement lors du rendez-vous</h3>
                <p className="text-gray-600">Pensez à prendre votre téléphone portable pour déclencher le paiement depuis votre messagerie Tradecoiner pendant le rendez-vous</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
