
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { LocationSelector } from "./LocationSelector";
import { PriceRangeSelector } from "./PriceRangeSelector";
import { ShippingSelector } from "./ShippingSelector";
import { SearchFilters } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="px-4">
          <h1 className="text-lg font-semibold">
            {totalCount.toLocaleString()} annonce{totalCount !== 1 ? 's' : ''}
            {location ? ` à ${location}` : ''}
          </h1>
        </div>

        <div className="relative">
          <ScrollArea className="w-full">
            <div className="flex gap-2 px-4 pb-4">
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
                  className="text-sm whitespace-nowrap shrink-0"
                >
                  Réinitialiser
                </Button>
              )}
            </div>
            <ScrollBar 
              orientation="horizontal" 
              className="h-2 bg-transparent"
            />
          </ScrollArea>
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    );
  }

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
