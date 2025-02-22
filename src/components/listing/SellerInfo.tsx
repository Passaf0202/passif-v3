
import { Star } from "lucide-react";

interface SellerInfoProps {
  seller: {
    avatar_url: string | null;
    full_name: string;
  };
  location: string;
  walletAddress?: string | null;
  rating?: number;
}

export const SellerInfo = ({ seller, location, walletAddress, rating = 5.0 }: SellerInfoProps) => {
  const truncateAddress = (address?: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Profil Vendeur</h2>
        <div className="flex items-center gap-1">
          <span>{rating.toFixed(1)}</span>
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <img
          src={seller.avatar_url || "/placeholder.svg"}
          alt={seller.full_name}
          className="h-12 w-12 rounded-full bg-gray-100"
        />
        <div className="space-y-1">
          <p className="font-medium">{seller.full_name}</p>
          <p className="text-sm text-gray-500">{location}</p>
          {walletAddress && (
            <p className="text-sm text-gray-500">
              Wallet: {truncateAddress(walletAddress)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
