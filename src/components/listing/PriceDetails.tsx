
import { Shield } from "lucide-react";
import { Badge } from "../ui/badge";

interface PriceDetailsProps {
  price: number;
  protectionFee?: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceDetails({
  price,
  protectionFee = 0,
  cryptoAmount,
  cryptoCurrency,
  size = "md"
}: PriceDetailsProps) {
  const formattedPrice = price.toFixed(2).replace(".", ",");
  
  const sizes = {
    sm: {
      priceClass: "text-base font-bold",
      cryptoClass: "text-xs",
      badgeSize: "sm" as const,
      iconSize: 12
    },
    md: {
      priceClass: "text-xl font-bold",
      cryptoClass: "text-sm",
      badgeSize: "default" as const,
      iconSize: 14
    },
    lg: {
      priceClass: "text-2xl font-bold",
      cryptoClass: "text-base",
      badgeSize: "lg" as const,
      iconSize: 16
    }
  };
  
  const {
    priceClass,
    cryptoClass,
    badgeSize,
    iconSize
  } = sizes[size];

  return (
    <div className="flex flex-col">
      <div className="flex items-center flex-wrap gap-1.5">
        <span className={priceClass}>{formattedPrice} €</span>
        {protectionFee > 0 && (
          <Badge variant="protected" size={badgeSize} className="flex items-center gap-1">
            <Shield className={`h-${iconSize / 4} w-${iconSize / 4}`} />
            <span>Protégé</span>
          </Badge>
        )}
      </div>
      {cryptoAmount && cryptoCurrency && (
        <p className={`${cryptoClass} text-gray-500`}>
          ≈ {cryptoAmount} {cryptoCurrency}
        </p>
      )}
    </div>
  );
}
