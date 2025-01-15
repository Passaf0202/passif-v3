import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VehicleBrandSelectProps {
  isCarCategory: boolean;
  popularCarBrands: string[];
  carBrands: string[];
  motorcycleBrands: string[];
  onBrandChange: (value: string) => void;
}

export function VehicleBrandSelect({
  isCarCategory,
  popularCarBrands,
  carBrands,
  motorcycleBrands,
  onBrandChange,
}: VehicleBrandSelectProps) {
  let brands = [];
  if (isCarCategory) {
    brands = [
      { label: "Marques populaires", options: popularCarBrands },
      { label: "Toutes les marques", options: carBrands }
    ];
  } else {
    brands = [{ label: "Marques", options: motorcycleBrands }];
  }

  return (
    <FormItem>
      <FormLabel>Marque</FormLabel>
      <Select onValueChange={onBrandChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une marque" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {brands.map((group) => (
            <div key={group.label}>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                {group.label}
              </div>
              {group.options.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}