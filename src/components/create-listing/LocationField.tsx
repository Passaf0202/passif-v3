
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "@/components/LocationPicker";

interface LocationFieldProps {
  form: UseFormReturn<any>;
  shippingMethod?: string;
}

export function LocationField({ form, shippingMethod }: LocationFieldProps) {
  const handleLocationChange = (location: string) => {
    form.setValue("location", location);
  };

  return (
    <FormField
      control={form.control}
      name="location"
      render={() => (
        <FormItem>
          <FormLabel>Localisation</FormLabel>
          <FormControl>
            {shippingMethod === "inPerson" ? (
              <LocationPicker onLocationChange={handleLocationChange} />
            ) : (
              <Input
                placeholder="Votre ville"
                onChange={(e) => handleLocationChange(e.target.value)}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
