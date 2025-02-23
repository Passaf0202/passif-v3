
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";

interface LocationFieldProps {
  form: UseFormReturn<any>;
  shippingMethod?: string;
}

export function LocationField({ form, shippingMethod }: LocationFieldProps) {
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [searchLocation, setSearchLocation] = useState<string>("");

  const handleLocationChange = (location: string) => {
    setCurrentLocation(location);
    form.setValue("location", location);
  };

  const handleInputBlur = () => {
    if (searchLocation) {
      handleLocationChange(searchLocation);
    }
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village;
          if (city) {
            setSearchLocation(city);
            handleLocationChange(city);
          }
        } catch (error) {
          console.error("Erreur de géolocalisation:", error);
        }
      });
    }
  };

  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel>Localisation</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Votre ville"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onBlur={handleInputBlur}
                  className="flex-1"
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleGeolocation}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Me localiser
                </Button>
              </div>
              <div className="h-[300px] rounded-lg overflow-hidden border">
                <LocationPicker
                  onLocationChange={handleLocationChange}
                  defaultLocation={currentLocation}
                />
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
