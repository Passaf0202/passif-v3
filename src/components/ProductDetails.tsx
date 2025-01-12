import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ProductDetailsProps {
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
  onDetailsChange: (details: {
    brand?: string;
    condition?: string;
    color?: string[];
    material?: string[];
  }) => void;
}

const conditions = [
  "Neuf avec étiquettes",
  "Neuf sans étiquettes",
  "Très bon état",
  "Bon état",
  "Satisfaisant"
];

const colors = [
  "Noir", "Blanc", "Rouge", "Bleu", "Vert", "Jaune", "Rose", "Violet", "Orange", "Marron", "Gris", "Multicolore"
];

const materials = [
  "Coton", "Polyester", "Laine", "Soie", "Lin", "Cuir", "Denim", "Velours", "Autre"
];

export function ProductDetails({ category, subcategory, onDetailsChange }: ProductDetailsProps) {
  if (!category) return null;

  const showClothingDetails = category === "Femmes" || category === "Hommes" || category === "Enfants";

  const handleChange = (field: string, value: string | string[]) => {
    onDetailsChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      {showClothingDetails && (
        <>
          <FormItem>
            <FormLabel>Marque</FormLabel>
            <FormControl>
              <Input 
                placeholder="Entrez la marque"
                onChange={(e) => handleChange("brand", e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>État</FormLabel>
            <Select onValueChange={(value) => handleChange("condition", value)}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez l'état" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Couleur principale</FormLabel>
            <Select onValueChange={(value) => handleChange("color", [value])}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la couleur" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Matière principale</FormLabel>
            <Select onValueChange={(value) => handleChange("material", [value])}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la matière" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </>
      )}
    </div>
  );
}