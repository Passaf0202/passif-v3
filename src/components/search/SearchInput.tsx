
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  titleOnly: boolean;
  onTitleOnlyChange: (value: boolean) => void;
  showCheckbox?: boolean;
}

export const SearchInput = ({ 
  value, 
  onChange, 
  onFocus,
  titleOnly,
  onTitleOnlyChange,
  showCheckbox = true 
}: SearchInputProps) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      className="pl-10 pr-4 h-10 rounded-full bg-gray-100 border-0 focus-visible:ring-1 focus-visible:ring-primary"
      placeholder="Que recherchez-vous ?"
      // Désactive le zoom sur mobile
      inputMode="text"
    />
  );
};
