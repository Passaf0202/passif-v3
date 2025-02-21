
import { MapPin } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LocationSelectorProps {
  currentLocation?: string;
  onLocationChange: (location: string) => void;
}

export function LocationSelector({ currentLocation, onLocationChange }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(currentLocation || "");

  const handleValidate = () => {
    onLocationChange(tempLocation);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempLocation("");
    onLocationChange("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {currentLocation || "Toute la France"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">Choisir une localisation</h3>
          
          <div className="space-y-2">
            <Input
              placeholder="Ville, code postal..."
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleClear}
            >
              Effacer
            </Button>
            <Button 
              className="flex-1"
              onClick={handleValidate}
            >
              Valider
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
