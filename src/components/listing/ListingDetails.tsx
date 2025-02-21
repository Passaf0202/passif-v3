import React from "react";
import { Shield, Star, MapPin, PackageOpen, Handshake, Calendar, Phone, SmilePlus, Home, ChevronRight } from "lucide-react";
import { ListingImages } from "./ListingImages";
import { ListingHeader } from "./ListingHeader";
import { SellerInfo } from "./SellerInfo";
import { ListingActions } from "./ListingActions";
import { ProductDetailsCard } from "./ProductDetailsCard";
import { LocationMap } from "./LocationMap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useCryptoConversion } from "@/hooks/useCryptoConversion";
import { useQuery } from "@tanstack/react-query";
import { validateAndUpdateCryptoAmount } from "@/hooks/escrow/useCryptoAmount";
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
  };
}

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showHowItWorks, setShowHowItWorks] = React.useState(false);
  
  const cryptoDetails = useCryptoConversion(listing.price, listing.crypto_currency);

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

  const handleBuyClick = () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour acheter",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/payment/${listing.id}`, { 
      state: { 
        listing: {
          ...listing,
          crypto_amount: listingData?.crypto_amount || cryptoDetails?.amount,
          crypto_currency: listingData?.crypto_currency || cryptoDetails?.currency,
          wallet_address: listingData?.wallet_address || listing.wallet_address
        },
        returnUrl: `/listings/${listing.id}`
      } 
    });
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

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Vêtements', href: '/categories/vetements' },
    { label: 'Alsace', href: '/region/alsace' },
    { label: 'Bas-Rhin', href: '/departement/bas-rhin' },
    { label: 'Strasbourg 67000', href: '/ville/strasbourg-67000' },
    { label: listing.title, href: '#' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <nav className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              <li>
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-500">{item.label}</span>
                ) : (
                  <Link to={item.href} className="text-gray-600 hover:text-gray-900">
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ListingImages images={listing.images} title={listing.title} isHovered={false} />

          <div className="space-y-6 bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//tradecoiner-logo.svg.png"
                  alt="Tradecoiner"
                  className="w-32 h-auto"
                />
                <h2 className="text-xl font-semibold">Protection Tradecoiner</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <PackageOpen className="h-5 w-5 text-gray-600" />
                  <p className="text-gray-700">Votre argent est sécurisé et versé au bon moment</p>
                </div>
                <div className="flex items-center gap-3">
                  <SmilePlus className="h-5 w-5 text-gray-600" />
                  <p className="text-gray-700">Notre service client dédié vous accompagne</p>
                </div>
                <a href="#" className="text-primary hover:underline block mt-4">
                  En savoir plus →
                </a>
              </div>
            </div>

            <Separator />
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Handshake className="h-6 w-6 text-gray-600" />
                <h2 className="text-xl font-semibold">Remise en main propre sécurisée</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <p className="text-gray-700">Réservez ce bien jusqu'au rendez-vous avec le vendeur</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <p className="text-gray-700">Restez libre de refuser ce bien s'il ne correspond pas à vos attentes</p>
                </div>
                <button 
                  onClick={() => setShowHowItWorks(true)}
                  className="text-primary hover:underline block mt-2"
                >
                  Comment ça marche ?
                </button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {listing.location}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationMap location={listing.location} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="sticky top-4 z-20">
            <Card>
              <CardContent className="p-6">
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

            <Card className="mt-6">
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

            <ProductDetailsCard details={listing} className="mt-6" />
          </div>
        </div>
      </div>

      <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
        <DialogContent className="bg-black/10 border-gray-200 text-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 mb-6">
              Les étapes de la remise en main propre avec paiement sécurisé
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <SmilePlus className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-gray-700">En réservant l'article, le vendeur vous confirme la disponibilité de l'article</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-gray-700">Vous vous organisez avec le vendeur pour définir le lieu et la date de votre rendez-vous</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-gray-700">Pensez à prendre votre téléphone portable pour déclencher le paiement depuis votre messagerie Tradecoiner pendant le rendez-vous</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
