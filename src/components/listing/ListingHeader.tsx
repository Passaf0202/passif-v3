
import { formatPrice } from "@/utils/priceUtils";
import { useCurrencyStore } from "@/stores/currencyStore";

interface ListingHeaderProps {
  title: string;
  price: number;
  cryptoAmount?: number | null;
  cryptoCurrency?: string;
  isMobile?: boolean;
  categories?: string[];
}

export const ListingHeader = ({ 
  title, 
  price,
  cryptoAmount,
  cryptoCurrency,
  isMobile,
  categories
}: ListingHeaderProps) => {
  const { selectedCurrency } = useCurrencyStore();

  return (
    <div>
      <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-2`}>{title}</h1>
      <div className="flex items-baseline gap-2 mb-2">
        <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-primary`}>
          {formatPrice(price)} {selectedCurrency}
        </p>
        {cryptoAmount && cryptoCurrency && (
          <p className="text-lg text-gray-600">
            ≈ {cryptoAmount.toFixed(8)} {cryptoCurrency}
          </p>
        )}
      </div>
      {categories && categories.length > 0 && (
        <div className="flex gap-2 mb-4">
          {categories.map((category, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
