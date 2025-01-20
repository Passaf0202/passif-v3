import { Shield } from "lucide-react";
import { SellerInfo } from "./SellerInfo";
import { ListingActions } from "./ListingActions";
import { ProductDetailsCard } from "./ProductDetailsCard";

interface ListingContentProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    user: {
      id: string;
      wallet_address?: string | null;
      avatar_url: string;
      full_name: string;
    };
    location: string;
    user_id: string;
    crypto_amount?: number;
    crypto_currency?: string;
  };
  handleBuyClick: () => void;
  cryptoDetails: { amount?: number; currency?: string } | null;
}

export const ListingContent = ({ listing, handleBuyClick, cryptoDetails }: ListingContentProps) => {
  return (
    <div className="space-y-6">
      <SellerInfo 
        seller={listing.user} 
        location={listing.location} 
        walletAddress={listing.user.wallet_address}
      />

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
        cryptoAmount={cryptoDetails?.amount}
        cryptoCurrency={cryptoDetails?.currency}
        handleBuyClick={handleBuyClick}
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
      </div>

      <ProductDetailsCard details={listing} />
    </div>
  );
};