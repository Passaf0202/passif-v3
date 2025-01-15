import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Truck, Package, Lightbulb } from "lucide-react";
import { useState } from "react";

interface ShippingDetailsProps {
  onShippingChange: (details: {
    method?: string;
    weight?: number;
  }) => void;
  category?: string;
  subcategory?: string;
}

const shippingMethods = [
  { id: "postal", label: "Envoi postal", icon: Truck },
  { id: "inPerson", label: "Remise en main propre", icon: Package },
];

const weightRanges = [
  { value: 250, label: "Moins de 250g" },
  { value: 500, label: "250g à 500g" },
  { value: 750, label: "500g à 750g" },
  { value: 1000, label: "750g à 1kg" },
  { value: 2000, label: "1kg à 2kg" },
  { value: 5000, label: "2kg à 5kg" },
  { value: 10000, label: "5kg à 10kg" },
];

const nonShippableCategories = ["Véhicules", "Immobilier"];

export function ShippingDetails({ onShippingChange, category, subcategory }: ShippingDetailsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>();
  
  const isShippingAllowed = !nonShippableCategories.includes(category || "");

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    onShippingChange({ method, weight: undefined });
  };

  const handleWeightChange = (weight: string) => {
    onShippingChange({ method: selectedMethod, weight: parseInt(weight) });
  };

  if (!isShippingAllowed) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <Package className="h-5 w-5 text-gray-500" />
        <p className="text-sm text-gray-600">
          Cette catégorie ne permet que la remise en main propre
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Mode de livraison</FormLabel>
        <Select onValueChange={handleMethodChange}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le mode de livraison" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {shippingMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                <div className="flex items-center gap-2">
                  <method.icon className="h-4 w-4" />
                  <span>{method.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      {selectedMethod === "postal" && (
        <FormItem>
          <FormLabel>Poids du colis</FormLabel>
          <Select onValueChange={handleWeightChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le poids" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {weightRanges.map((range) => (
                <SelectItem key={range.value} value={range.value.toString()}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}

      <div className="flex items-center gap-2 text-primary mt-2">
        <Lightbulb className="h-5 w-5" />
        <p className="text-sm">
          La remise en main propre est recommandée pour les objets de valeur
        </p>
      </div>
    </div>
  );
}