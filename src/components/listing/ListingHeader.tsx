import { formatPrice } from "@/utils/priceUtils";
import { useCurrencyStore } from "@/stores/currencyStore";

interface ListingHeaderProps {
  title: string;
  price: number;
  cryptoAmount?: number | null;
  cryptoCurrency?: string;
}

export const ListingHeader = ({ 
  title, 
  price,
  cryptoAmount,
  cryptoCurrency 
}: ListingHeaderProps) => {
  const { selectedCurrency } = useCurrencyStore();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-primary">
          {formatPrice(price)} {selectedCurrency}
        </p>
        {cryptoAmount && cryptoCurrency && (
          <p className="text-lg text-gray-600">
            ≈ {cryptoAmount.toFixed(8)} {cryptoCurrency}
          </p>
        )}
      </div>
    </div>
  );
};