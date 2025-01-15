import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShippingDetails } from "@/components/ShippingDetails";
import { LocationField } from "./LocationField";
import { UseFormReturn } from "react-hook-form";

interface ShippingLocationSectionProps {
  form: UseFormReturn<any>;
  shippingMethod?: string;
  onShippingChange: (details: { method?: string; weight?: number }) => void;
  category?: string;
}

export function ShippingLocationSection({ 
  form, 
  shippingMethod, 
  onShippingChange,
  category 
}: ShippingLocationSectionProps) {
  const isVehicle = category === "Véhicules";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {!isVehicle && (
            <>
              <ShippingDetails onShippingChange={onShippingChange} />
              <Separator className="my-4" />
            </>
          )}
          <LocationField
            form={form}
            shippingMethod={shippingMethod}
          />
        </div>
      </CardContent>
    </Card>
  );
}