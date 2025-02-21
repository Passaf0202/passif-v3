
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ShippingSelectorProps {
  currentMethod?: string;
  onMethodChange: (method: string) => void;
}

export function ShippingSelector({ currentMethod, onMethodChange }: ShippingSelectorProps) {
  const methods = [
    { value: "postal", label: "Envoi postal" },
    { value: "inPerson", label: "Remise en main propre" }
  ];

  const getButtonLabel = () => {
    if (!currentMethod) return "Mode de livraison";
    const method = methods.find(m => m.value === currentMethod);
    return method?.label || "Mode de livraison";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          {getButtonLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">Mode de livraison</h3>
          
          <RadioGroup 
            value={currentMethod} 
            onValueChange={onMethodChange}
            className="space-y-2"
          >
            {methods.map((method) => (
              <div key={method.value} className="flex items-center space-x-2">
                <RadioGroupItem value={method.value} id={method.value} />
                <Label htmlFor={method.value}>{method.label}</Label>
              </div>
            ))}
          </RadioGroup>

          {currentMethod && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onMethodChange("")}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
