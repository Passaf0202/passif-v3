
import React from "react";
import { Shield, Star, MapPin, PackageOpen, Handshake, Calendar, Phone, SmilePlus, Home, ArrowLeft, Heart } from "lucide-react";
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
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ListingDetailsProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    created_at: string;
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
    category?: string;
  };
}

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const cryptoDetails = useCryptoConversion(listing.price, listing.crypto_currency);

  const { data: listingData } = useQuery({
    queryKey: ['listing-wallet', listing.id],
    queryFn: async () => {
      try {
        const validatedListing = await validateAndUpdateCryptoAmount(listing);
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
    return (
      <div className="text-center p-4">
        <p>Information du vendeur non disponible</p>
      </div>
    );
  }

  const timeAgo = formatDistance(new Date(listing.created_at), new Date(), { 
    addSuffix: true,
    locale: fr 
  });

  return (
    <div className="pb-32 md:pb-0">
      {/* Version mobile */}
      <div className="md:hidden">
        <div className="relative">
          <div className="h-[250px] w-full">
            <ListingImages images={listing.images} title={listing.title} />
          </div>
          
          {/* Boutons de navigation */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-20">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/90 hover:bg-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/90 hover:bg-white"
            >
              <Heart className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-4 -mt-6 relative z-10 bg-white rounded-t-3xl">
          <div className="space-y-4 pt-6">
            <div>
              <h1 className="text-xl font-semibold mb-2">{listing.title}</h1>
              <div className="flex flex-col space-y-1">
                <p className="text-2xl font-bold">{listing.price} €</p>
                {cryptoDetails && (
                  <p className="text-sm text-gray-600">
                    ≈ {cryptoDetails.amount.toFixed(8)} {cryptoDetails.currency}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {listing.category && <Badge variant="secondary">{listing.category}</Badge>}
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
              <span>{timeAgo}</span>
            </div>

            {/* Reste du contenu */}
            <ProductDetailsCard details={listing} />

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Localisation</h2>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {listing.location}
              </p>
              <div className="h-[200px] rounded-lg overflow-hidden">
                <LocationMap location={listing.location} />
              </div>
            </div>

            <SellerInfo 
              seller={listing.user} 
              location={listing.location} 
              walletAddress={listingData?.wallet_address || listing.wallet_address}
            />

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Protection acheteur Tradecoiner
              </h2>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <PackageOpen className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-medium">Paiement sécurisé</p>
                    <p className="text-sm text-gray-600">Votre argent est sécurisé jusqu'à la réception</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <SmilePlus className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-medium">Support dédié</p>
                    <p className="text-sm text-gray-600">Une équipe à votre écoute 7j/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version desktop */}
      <div className="hidden md:block">
        <ListingImages images={listing.images} title={listing.title} />
      </div>

      {/* Reste du contenu */}
      <div className="px-4 md:px-0 space-y-6 mt-4">
        {/* Caractéristiques du produit */}
        <ProductDetailsCard details={listing} />

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
        </div>

        {/* Localisation */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Localisation</h2>
          <p className="text-gray-600 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {listing.location}
          </p>
          <div className="h-[200px] rounded-lg overflow-hidden">
            <LocationMap location={listing.location} />
          </div>
        </div>

        {/* Infos vendeur */}
        <SellerInfo 
          seller={listing.user} 
          location={listing.location} 
          walletAddress={listingData?.wallet_address || listing.wallet_address}
        />

        {/* Protection acheteur */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Protection acheteur Tradecoiner
          </h2>
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <PackageOpen className="h-5 w-5 text-gray-600 mt-1" />
              <div>
                <p className="font-medium">Paiement sécurisé</p>
                <p className="text-sm text-gray-600">Votre argent est sécurisé jusqu'à la réception</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <SmilePlus className="h-5 w-5 text-gray-600 mt-1" />
              <div>
                <p className="font-medium">Support dédié</p>
                <p className="text-sm text-gray-600">Une équipe à votre écoute 7j/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'actions fixe en bas en mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden">
        <ListingActions
          listingId={listing.id}
          sellerId={listing.user_id}
          sellerAddress={listingData?.wallet_address || listing.wallet_address}
          title={listing.title}
          price={listing.price}
          cryptoAmount={listingData?.crypto_amount || cryptoDetails?.amount}
          cryptoCurrency={listingData?.crypto_currency || cryptoDetails?.currency}
          handleBuyClick={handleBuyClick}
        />
      </div>
    </div>
  );
};
