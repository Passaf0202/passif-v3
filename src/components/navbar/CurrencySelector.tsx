import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrencyStore } from "@/stores/currencyStore";

export function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency } = useCurrencyStore();

  return (
    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Devise" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="EUR">EUR</SelectItem>
        <SelectItem value="USD">USD</SelectItem>
        <SelectItem value="GBP">GBP</SelectItem>
      </SelectContent>
    </Select>
  );
}