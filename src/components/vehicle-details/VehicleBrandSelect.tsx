import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // Si aucune marque n'est disponible dans la base de données, utiliser des marques par défaut
  const defaultPopularCarBrands = popularCarBrands.length > 0 ? popularCarBrands : [
    "Renault", "Peugeot", "Citroën", "Volkswagen", "BMW", "Mercedes", "Audi"
  ];

  const defaultCarBrands = carBrands.length > 0 ? carBrands : [
    "Alfa Romeo", "Alpine", "Aston Martin", "Audi", "Bentley", "BMW", "Citroën",
    "Cupra", "Dacia", "DS", "Ferrari", "Fiat", "Ford", "Honda", "Hyundai",
    "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus", "Maserati",
    "Mazda", "Mercedes", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot",
    "Porsche", "Renault", "Seat", "Skoda", "Smart", "Subaru", "Suzuki",
    "Tesla", "Toyota", "Volkswagen", "Volvo"
  ];

  const defaultMotorcycleBrands = motorcycleBrands.length > 0 ? motorcycleBrands : [
    "BMW", "Ducati", "Harley-Davidson", "Honda", "Kawasaki", "KTM",
    "Suzuki", "Triumph", "Yamaha"
  ];

  return (
    <FormItem className="w-full">
      <FormLabel>Marque</FormLabel>
      <Select onValueChange={onBrandChange}>
        <FormControl>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Sélectionnez une marque" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="bg-white max-h-[300px]">
          {isCarCategory ? (
            <>
              <SelectGroup>
                <SelectLabel className="text-sm font-semibold text-gray-500 px-2 py-1">
                  Marques populaires
                </SelectLabel>
                {defaultPopularCarBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-sm font-semibold text-gray-500 px-2 py-1">
                  Toutes les marques
                </SelectLabel>
                {defaultCarBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : (
            <SelectGroup>
              <SelectLabel className="text-sm font-semibold text-gray-500 px-2 py-1">
                Marques de motos
              </SelectLabel>
              {defaultMotorcycleBrands.map((brand) => (
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