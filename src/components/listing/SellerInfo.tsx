
interface SellerInfoProps {
  seller: {
    avatar_url: string | null;
    full_name: string;
  };
  location: string;
  walletAddress?: string | null;
}

export const SellerInfo = ({ seller, location, walletAddress }: SellerInfoProps) => {
  const truncateAddress = (address?: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-4">
      <img
        src={seller.avatar_url || "/placeholder.svg"}
        alt={seller.full_name}
        className="h-12 w-12 rounded-full"
      />
      <div>
        <p className="font-semibold">{seller.full_name}</p>
        <p className="text-sm text-gray-500">{location}</p>
        {walletAddress && (
          <p className="text-sm text-gray-500">
            Wallet: {truncateAddress(walletAddress)}
          </p>
        )}
      </div>
    </div>
  );
};
