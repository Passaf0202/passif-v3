import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchFilters } from "../types";
import { Separator } from "@/components/ui/separator";

interface SearchFiltersContentProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export const SearchFiltersContent = ({ filters, onFiltersChange }: SearchFiltersContentProps) => {
  const conditions = ["Neuf", "Très bon état", "Bon état", "État moyen"];
  const shippingMethods = ["Remise en main propre", "Colissimo", "Mondial Relay"];

  return (
    <div className="py-4 space-y-6">
      <div className="space-y-4">
        <Label className="font-medium">Prix</Label>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Min</Label>
            <Input
              type="number"
              placeholder="Prix min"
              value={filters.minPrice || ""}
              onChange={(e) => onFiltersChange({ ...filters, minPrice: Number(e.target.value) || undefined })}
            />
          </div>
          <div className="flex-1">
            <Label>Max</Label>
            <Input
              type="number"
              placeholder="Prix max"
              value={filters.maxPrice || ""}
              onChange={(e) => onFiltersChange({ ...filters, maxPrice: Number(e.target.value) || undefined })}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="font-medium">État</Label>
        <Select
          value={filters.condition || ""}
          onValueChange={(value) => onFiltersChange({ ...filters, condition: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un état" />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((condition) => (
              <SelectItem key={condition} value={condition}>
                {condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="font-medium">Mode de livraison</Label>
        <Select
          value={filters.shipping_method || ""}
          onValueChange={(value) => onFiltersChange({ ...filters, shipping_method: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un mode de livraison" />
          </SelectTrigger>
          <SelectContent>
            {shippingMethods.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="font-medium">Localisation</Label>
        <Input
          placeholder="Ville ou région"
          value={filters.location || ""}
          onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
        />
      </div>
    </div>
  );
};