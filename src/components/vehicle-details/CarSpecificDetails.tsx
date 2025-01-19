import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface CarSpecificDetailsProps {
  getAttributeValues: (type: string) => string[];
  onDetailsChange: (field: string, value: any) => void;
}

export function CarSpecificDetails({ getAttributeValues, onDetailsChange }: CarSpecificDetailsProps) {
  const renderSelectItems = (values: string[]) => {
    return values
      .filter(value => value && value.trim() !== '') // Filtrer les valeurs vides
      .map((value) => (
        <SelectItem key={value} value={value}>
          {value}
        </SelectItem>
      ));
  };

  return (
    <>
      <FormItem>
        <FormLabel>Type de carburant</FormLabel>
        <Select onValueChange={(value) => onDetailsChange("fuelType", value)}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type de carburant" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {renderSelectItems(getAttributeValues("fuel_type"))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Boîte de vitesse</FormLabel>
        <Select onValueChange={(value) => onDetailsChange("transmission", value)}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type de boîte" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {renderSelectItems(getAttributeValues("transmission_type"))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Type de véhicule</FormLabel>
        <Select onValueChange={(value) => onDetailsChange("vehicleType", value)}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type de véhicule" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {renderSelectItems(getAttributeValues("vehicle_type"))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Nombre de portes</FormLabel>
        <Select onValueChange={(value) => onDetailsChange("doors", value)}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le nombre de portes" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {renderSelectItems(getAttributeValues("doors"))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Sellerie</FormLabel>
        <Select onValueChange={(value) => onDetailsChange("upholstery", value)}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type de sellerie" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {renderSelectItems(getAttributeValues("upholstery"))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Couleur</FormLabel>
        <Select onValueChange={(value) => onDetailsChange("color", [value])}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la couleur" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {renderSelectItems(getAttributeValues("color"))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Caractéristiques</FormLabel>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="maintenance_book"
              onCheckedChange={(checked) => {
                const characteristics = checked 
                  ? ["Carnet d'entretien disponible"]
                  : [];
                onDetailsChange("characteristics", characteristics);
              }}
            />
            <label htmlFor="maintenance_book">Carnet d'entretien disponible</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="non_smoker"
              onCheckedChange={(checked) => {
                const characteristics = checked 
                  ? ["Véhicule non fumeur"]
                  : [];
                onDetailsChange("characteristics", characteristics);
              }}
            />
            <label htmlFor="non_smoker">Véhicule non fumeur</label>
          </div>
        </div>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>État du véhicule</FormLabel>
        <Select onValueChange={(value) => onDetailsChange("vehicleCondition", value)}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez l'état du véhicule" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="non_damaged">Non endommagé</SelectItem>
            <SelectItem value="damaged">Endommagé</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Vignette Crit'Air</FormLabel>
        <Select onValueChange={(value) => onDetailsChange("critAir", value)}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la vignette Crit'Air" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {renderSelectItems(getAttributeValues("crit_air"))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Classe d'émission</FormLabel>
        <Select onValueChange={(value) => onDetailsChange("emissionClass", value)}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la classe d'émission" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {renderSelectItems(getAttributeValues("emission_class"))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </>
  );
}