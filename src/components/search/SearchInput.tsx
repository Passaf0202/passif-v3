
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Label } from "@/components/ui/label";

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  titleOnly?: boolean;
  onTitleOnlyChange?: (value: boolean) => void;
  showCheckbox?: boolean;
  initialQuery?: string;  // Ajouté pour corriger l'erreur de type
  onFilterChange?: (filters: any) => void;  // Ajouté pour corriger l'erreur de type
}

export const SearchInput = ({ 
  value, 
  onChange, 
  onFocus,
  titleOnly = false,
  onTitleOnlyChange,
  showCheckbox = true,
  initialQuery = "",
  onFilterChange
}: SearchInputProps) => {
  const [searchValue, setSearchValue] = useState(initialQuery || value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={searchValue}
        onChange={handleChange}
        onFocus={onFocus}
        className="pl-10 pr-4 h-10 rounded-full bg-gray-100 border-0 focus-visible:ring-1 focus-visible:ring-primary"
        placeholder="Que recherchez-vous ?"
        // Désactive le zoom sur mobile
        inputMode="text"
      />
      
      {showCheckbox && onTitleOnlyChange && (
        <div className="mt-2 flex items-center space-x-2">
          <Checkbox
            id="title-only"
            checked={titleOnly}
            onCheckedChange={(checked) => onTitleOnlyChange(!!checked)}
          />
          <Label htmlFor="title-only" className="text-sm text-gray-600">
            Rechercher dans les titres uniquement
          </Label>
        </div>
      )}
    </div>
  );
};
