import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Truck, Package } from "lucide-react";
import { useState } from "react";

interface ShippingDetailsProps {
  onShippingChange: (details: {
    method?: string;
    weight?: number;
  }) => void;
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

export function ShippingDetails({ onShippingChange }: ShippingDetailsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>();

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    onShippingChange({ method, weight: undefined });
  };

  const handleWeightChange = (weight: string) => {
    onShippingChange({ method: selectedMethod, weight: parseInt(weight) });
  };

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
    </div>
  );
}