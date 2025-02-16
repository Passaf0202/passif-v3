
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  titleOnly: boolean;
  onTitleOnlyChange: (checked: boolean) => void;
  showCheckbox?: boolean;
}

export const SearchInput = ({
  value,
  onChange,
  onFocus,
  titleOnly,
  onTitleOnlyChange,
  showCheckbox = true,
}: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full">
      <Input
        placeholder="Rechercher sur Tradecoiner"
        className="h-8 text-sm rounded-full bg-gray-100 border-transparent focus:border-transparent focus:ring-0 pl-10 pr-4 transition-all duration-200 placeholder:text-gray-500 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          onFocus();
        }}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};
