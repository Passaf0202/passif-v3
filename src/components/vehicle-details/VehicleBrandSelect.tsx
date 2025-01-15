import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

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
  console.log("VehicleBrandSelect props:", {
    isCarCategory,
    popularCarBrands,
    carBrands,
    motorcycleBrands,
  });

  return (
    <FormItem className="w-full">
      <FormLabel>Marque</FormLabel>
      <Select onValueChange={onBrandChange}>
        <FormControl>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Sélectionnez une marque" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="bg-white">
          {isCarCategory ? (
            <>
              <SelectGroup>
                <SelectLabel className="text-sm font-semibold text-gray-500">
                  Marques populaires
                </SelectLabel>
                {popularCarBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-sm font-semibold text-gray-500">
                  Toutes les marques
                </SelectLabel>
                {carBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : (
            <SelectGroup>
              <SelectLabel>Marques de motos</SelectLabel>
              {motorcycleBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}