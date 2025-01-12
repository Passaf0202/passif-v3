interface SellerInfoProps {
  seller: {
    avatar_url: string | null;
    full_name: string;
  };
  location: string;
}

export const SellerInfo = ({ seller, location }: SellerInfoProps) => {
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
      </div>
    </div>
  );
};