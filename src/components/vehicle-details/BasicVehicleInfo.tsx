import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface BasicVehicleInfoProps {
  onDetailsChange: (field: string, value: any) => void;
}

export function BasicVehicleInfo({ onDetailsChange }: BasicVehicleInfoProps) {
  return (
    <>
      <FormItem>
        <FormLabel>Modèle</FormLabel>
        <FormControl>
          <Input 
            placeholder="Ex: Golf VII"
            onChange={(e) => onDetailsChange("model", e.target.value)}
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Année du modèle</FormLabel>
        <FormControl>
          <Input 
            type="number"
            placeholder="Ex: 2018"
            onChange={(e) => onDetailsChange("year", parseInt(e.target.value))}
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Plaque d'immatriculation</FormLabel>
        <FormControl>
          <Input 
            placeholder="Ex: AB-123-CD"
            onChange={(e) => onDetailsChange("registration", e.target.value)}
          />
        </FormControl>
        <FormMessage />
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            La plaque d'immatriculation est uniquement conservée par nos services et ne sera pas visible sur l'annonce
          </AlertDescription>
        </Alert>
      </FormItem>

      <FormItem>
        <FormLabel>Date de première mise en circulation</FormLabel>
        <FormControl>
          <Input 
            type="date"
            onChange={(e) => onDetailsChange("firstRegistrationDate", e.target.value)}
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Date de fin de validité du contrôle technique</FormLabel>
        <FormControl>
          <Input 
            type="date"
            onChange={(e) => onDetailsChange("technicalInspectionDate", e.target.value)}
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Kilométrage</FormLabel>
        <FormControl>
          <Input 
            type="number"
            placeholder="En kilomètres"
            onChange={(e) => onDetailsChange("mileage", parseInt(e.target.value))}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </>
  );
}