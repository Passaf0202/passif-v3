
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { LocationSelector } from "./LocationSelector";
import { PriceRangeSelector } from "./PriceRangeSelector";
import { ShippingSelector } from "./ShippingSelector";
import { SearchFilters } from "../types";

interface SearchFiltersHeaderProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  totalCount: number;
  location?: string;
}

export function SearchFiltersHeader({ 
  filters, 
  onFiltersChange,
  totalCount,
  location 
}: SearchFiltersHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-xl font-semibold">
          {totalCount.toLocaleString()} annonce{totalCount !== 1 ? 's' : ''} {location ? `à ${location}` : ''}
        </h1>

        <div className="flex flex-wrap gap-2">
          <LocationSelector 
            currentLocation={filters.location}
            onLocationChange={(loc) => onFiltersChange({ ...filters, location: loc })}
          />
          
          <PriceRangeSelector
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onPriceChange={(min, max) => 
              onFiltersChange({ ...filters, minPrice: min, maxPrice: max })
            }
          />

          <ShippingSelector
            currentMethod={filters.shipping_method}
            onMethodChange={(method) => 
              onFiltersChange({ ...filters, shipping_method: method })
            }
          />

          {Object.keys(filters).length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => onFiltersChange({})}
              className="text-sm"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
