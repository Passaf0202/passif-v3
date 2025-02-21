
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Euro } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PriceRangeSelectorProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
}

export function PriceRangeSelector({ 
  minPrice, 
  maxPrice, 
  onPriceChange 
}: PriceRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempMin, setTempMin] = useState(minPrice?.toString() || "");
  const [tempMax, setTempMax] = useState(maxPrice?.toString() || "");

  const handleValidate = () => {
    const min = tempMin ? parseInt(tempMin, 10) : undefined;
    const max = tempMax ? parseInt(tempMax, 10) : undefined;
    onPriceChange(min, max);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempMin("");
    setTempMax("");
    onPriceChange(undefined, undefined);
    setIsOpen(false);
  };

  const getButtonLabel = () => {
    if (!minPrice && !maxPrice) return "Prix";
    if (minPrice && !maxPrice) return `À partir de ${minPrice}€`;
    if (!minPrice && maxPrice) return `Jusqu'à ${maxPrice}€`;
    return `${minPrice}€ - ${maxPrice}€`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Euro className="h-4 w-4" />
          {getButtonLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">Définir une fourchette de prix</h3>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min"
                value={tempMin}
                onChange={(e) => setTempMin(e.target.value)}
                min="0"
              />
            </div>
            <div className="flex items-center">-</div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max"
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                min={tempMin || "0"}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleClear}
            >
              Effacer
            </Button>
            <Button 
              className="flex-1"
              onClick={handleValidate}
            >
              Valider
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
